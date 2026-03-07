import { execFile } from 'node:child_process';
import { writeFile, unlink, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { extractAddressImports, type FlowNetwork } from './lsp/client.js';

// --- Types ---

export interface ContractInfo {
  name: string;
  address: string;
  source: string;
  imports: string[]; // "0xAddress.ContractName" references
}

/** Lightweight manifest entry (no source code) for dependency graph overview */
export interface ContractManifestEntry {
  name: string;
  address: string;
  size: number; // source code length in chars
  imports: string[];
}

export interface ContractTree {
  target: string; // address queried
  network: FlowNetwork;
  contracts: ContractInfo[];
}

/** Manifest-only tree (no source code, suitable for LLM overview) */
export interface ContractManifest {
  target: string;
  network: FlowNetwork;
  contracts: ContractManifestEntry[];
  totalSize: number;
}

export type Severity = 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  rule: string;
  severity: Severity;
  line: number;
  message: string;
}

export interface ScanResult {
  findings: Finding[];
  summary: { high: number; medium: number; low: number; info: number };
}

// --- Contract Source Fetching ---

/**
 * Run `flow accounts get` and parse the JSON output to extract contract names and source code.
 */
export async function fetchAccountContracts(
  address: string,
  network: FlowNetwork,
  flowCommand = 'flow',
): Promise<{ name: string; source: string }[]> {
  const stdout = await new Promise<string>((resolve, reject) => {
    execFile(
      flowCommand,
      ['accounts', 'get', address, '--network', network, '--include', 'contracts', '--output', 'json'],
      { timeout: 30000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to fetch account ${address} on ${network}: ${stderr || error.message}`));
        } else {
          resolve(stdout);
        }
      },
    );
  });

  const data = JSON.parse(stdout);
  const contracts: { name: string; source: string }[] = [];

  // Flow CLI JSON output uses "code" field: { "code": { "ContractName": "source" } }
  // Fall back to "contracts" for potential future CLI versions
  const codeMap = data.code ?? data.contracts;
  if (codeMap && typeof codeMap === 'object') {
    for (const [name, codeValue] of Object.entries(codeMap)) {
      contracts.push({ name, source: String(codeValue) });
    }
  }

  return contracts;
}

/** Function signature for fetching contracts from an address (injectable for testing) */
export type AccountContractFetcher = (
  address: string,
  network: FlowNetwork,
) => Promise<{ name: string; source: string }[]>;

export interface FetchContractSourceOptions {
  recurse?: boolean;
  flowCommand?: string;
  /** Override the default fetcher (for testing) */
  fetcher?: AccountContractFetcher;
}

/**
 * Fetch contract source code from an on-chain address, optionally recursing into dependencies.
 */
export async function fetchContractSource(
  address: string,
  network: FlowNetwork,
  optionsOrRecurse: boolean | FetchContractSourceOptions = true,
  flowCommand = 'flow',
): Promise<ContractTree> {
  // Support legacy (address, network, recurse, flowCommand) signature
  let recurse: boolean;
  let fetcher: AccountContractFetcher;
  if (typeof optionsOrRecurse === 'boolean') {
    recurse = optionsOrRecurse;
    fetcher = (addr, net) => fetchAccountContracts(addr, net, flowCommand);
  } else {
    recurse = optionsOrRecurse.recurse ?? true;
    const cmd = optionsOrRecurse.flowCommand ?? flowCommand;
    fetcher = optionsOrRecurse.fetcher ?? ((addr, net) => fetchAccountContracts(addr, net, cmd));
  }

  const visited = new Set<string>(); // "0xAddress" already fetched
  const allContracts: ContractInfo[] = [];
  const queue: string[] = [normalizeAddress(address)];

  while (queue.length > 0) {
    const addr = queue.shift()!;
    if (visited.has(addr)) continue;
    visited.add(addr);

    const accountContracts = await fetcher(addr, network);

    for (const { name, source } of accountContracts) {
      const imports = extractAddressImports(source);
      const importRefs = imports.map((i) => `0x${i.address}.${i.name}`);

      allContracts.push({
        name,
        address: addr,
        source,
        imports: importRefs,
      });

      if (recurse) {
        for (const imp of imports) {
          const depAddr = normalizeAddress(`0x${imp.address}`);
          if (!visited.has(depAddr)) {
            queue.push(depAddr);
          }
        }
      }
    }
  }

  return { target: normalizeAddress(address), network, contracts: allContracts };
}

/** Convert a full ContractTree to a lightweight manifest (strips source code) */
export function toManifest(tree: ContractTree): ContractManifest {
  let totalSize = 0;
  const contracts: ContractManifestEntry[] = tree.contracts.map((c) => {
    totalSize += c.source.length;
    return { name: c.name, address: c.address, size: c.source.length, imports: c.imports };
  });
  return { target: tree.target, network: tree.network, contracts, totalSize };
}

/**
 * Fetch source code for a single contract by address.
 * If `contractName` is provided, returns only that contract; otherwise all contracts on the address.
 */
export async function fetchSingleContractCode(
  address: string,
  network: FlowNetwork,
  contractName?: string,
  flowCommand = 'flow',
): Promise<{ name: string; source: string }[]> {
  const all = await fetchAccountContracts(normalizeAddress(address), network, flowCommand);
  if (contractName) {
    const match = all.filter((c) => c.name === contractName);
    if (match.length === 0) {
      throw new Error(`Contract '${contractName}' not found on ${address}. Available: ${all.map((c) => c.name).join(', ')}`);
    }
    return match;
  }
  return all;
}

function normalizeAddress(addr: string): string {
  return addr.startsWith('0x') ? addr : `0x${addr}`;
}

// --- Security Scan Rules ---

interface Rule {
  id: string;
  severity: Severity;
  pattern: RegExp;
  message: string | ((match: RegExpExecArray) => string);
  /** If true, match against each line individually. Otherwise full-text. Default: true */
  perLine?: boolean;
}

const RULES: Rule[] = [
  {
    id: 'overly-permissive-access',
    severity: 'high',
    pattern: /access\(all\)\s+(var|let)\s+/,
    message: 'State field with access(all) — consider restricting access with entitlements',
  },
  {
    id: 'overly-permissive-function',
    severity: 'medium',
    pattern: /access\(all\)\s+fun\s+(\w+)/,
    message: (m) => `Function '${m[1]}' has access(all) — review if public access is intended`,
  },
  {
    id: 'deprecated-pub',
    severity: 'info',
    pattern: /\bpub\s+(var|let|fun|resource|struct|event|contract|enum)\b/,
    message: '`pub` is deprecated in Cadence 1.0 — use `access(all)` or a more restrictive access modifier',
  },
  {
    id: 'unsafe-force-unwrap',
    severity: 'medium',
    pattern: /[)\w]\s*!/,
    message: 'Force-unwrap (!) used — consider nil-coalescing (??) or optional binding (if let) for safer handling',
  },
  {
    id: 'auth-account-exposure',
    severity: 'high',
    pattern: /\bAuthAccount\b/,
    message: 'AuthAccount reference found — passing AuthAccount gives full account access, use capabilities instead',
  },
  {
    id: 'auth-account-exposure',
    severity: 'high',
    pattern: /\bauth\s*\(.*?\)\s*&Account\b/,
    message: 'auth(…) &Account reference found — this grants broad account access, prefer scoped capabilities',
  },
  {
    id: 'hardcoded-address',
    severity: 'low',
    pattern: /(?<!import\s+\w+\s+from\s+)0x[0-9a-fA-F]{8,16}\b/,
    message: 'Hardcoded address detected — consider using named address imports for portability',
  },
  {
    id: 'unguarded-capability',
    severity: 'high',
    pattern: /\.publish\s*\(/,
    message: 'Capability published — verify that proper entitlements guard this capability',
  },
  {
    id: 'potential-reentrancy',
    severity: 'medium',
    pattern: /\.borrow\b.*\n.*\bself\./,
    message: 'State modification after external borrow — potential reentrancy risk',
    perLine: false,
  },
  {
    id: 'resource-loss-destroy',
    severity: 'high',
    pattern: /destroy\s*\(/,
    message: 'Explicit destroy call — ensure the resource is intentionally being destroyed and not lost',
  },
];

/**
 * Run static security rules against Cadence source code.
 * Returns structured findings.
 */
export function securityScan(code: string): ScanResult {
  const findings: Finding[] = [];
  const lines = code.split('\n');

  for (const rule of RULES) {
    if (rule.perLine === false) {
      // Full-text matching (for multi-line patterns)
      const re = new RegExp(rule.pattern.source, rule.pattern.flags + (rule.pattern.flags.includes('g') ? '' : 'g'));
      let match: RegExpExecArray | null;
      while ((match = re.exec(code)) !== null) {
        const lineNum = code.slice(0, match.index).split('\n').length;
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          line: lineNum,
          message: typeof rule.message === 'function' ? rule.message(match) : rule.message,
        });
      }
    } else {
      // Per-line matching (default)
      for (let i = 0; i < lines.length; i++) {
        const match = rule.pattern.exec(lines[i]);
        if (match) {
          findings.push({
            rule: rule.id,
            severity: rule.severity,
            line: i + 1,
            message: typeof rule.message === 'function' ? rule.message(match) : rule.message,
          });
        }
        // Reset regex lastIndex for non-global patterns
        rule.pattern.lastIndex = 0;
      }
    }
  }

  // Sort by line number
  findings.sort((a, b) => a.line - b.line);

  const summary = { high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) {
    summary[f.severity]++;
  }

  return { findings, summary };
}

/**
 * Format scan results as readable text.
 */
// --- Script Execution ---

export interface ScriptResult {
  value: string;
  error?: undefined;
}

export interface ScriptError {
  value?: undefined;
  error: string;
}

/** Function signature for executing scripts (injectable for testing) */
export type ScriptExecutor = (
  code: string,
  args: string[],
  network: FlowNetwork,
) => Promise<ScriptResult | ScriptError>;

/**
 * Execute a read-only Cadence script on-chain via `flow scripts execute`.
 * Args use Flow CLI format: ["Type:Value", ...], e.g. ["Address:0x1654653399040a61", "UFix64:10.0"]
 */
export async function executeScript(
  code: string,
  network: FlowNetwork,
  args: string[] = [],
  flowCommand = 'flow',
): Promise<ScriptResult | ScriptError> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'cadence-mcp-'));
  const scriptFile = join(tmpDir, 'script.cdc');

  try {
    await writeFile(scriptFile, code, 'utf-8');

    const cliArgs = ['scripts', 'execute', scriptFile, '--network', network, '--output', 'json'];
    for (const arg of args) {
      cliArgs.push('--arg', arg);
    }

    const stdout = await new Promise<string>((resolve, reject) => {
      execFile(
        flowCommand,
        cliArgs,
        { timeout: 30000, maxBuffer: 5 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr || error.message));
          } else {
            resolve(stdout);
          }
        },
      );
    });

    // Flow CLI --output json returns the result value
    const trimmed = stdout.trim();
    return { value: trimmed };
  } catch (e: any) {
    return { error: e.message };
  } finally {
    // Clean up temp files
    await unlink(scriptFile).catch(() => {});
  }
}

export function formatScanResult(result: ScanResult): string {
  const lines: string[] = [];

  lines.push(`## Security Scan Results`);
  lines.push(`Found ${result.findings.length} issue(s): ${result.summary.high} high, ${result.summary.medium} medium, ${result.summary.low} low, ${result.summary.info} info`);
  lines.push('');

  if (result.findings.length === 0) {
    lines.push('No issues detected by static analysis rules.');
    return lines.join('\n');
  }

  for (const f of result.findings) {
    const sevLabel = f.severity.toUpperCase();
    lines.push(`- [${sevLabel}] Line ${f.line}: (${f.rule}) ${f.message}`);
  }

  return lines.join('\n');
}
