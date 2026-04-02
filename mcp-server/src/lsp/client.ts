import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { writeFile, readFile, access, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface Diagnostic {
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  severity?: number; // 1=Error, 2=Warning, 3=Info, 4=Hint
  message: string;
  source?: string;
}

const SEVERITY_LABELS: Record<number, string> = {
  1: 'error',
  2: 'warning',
  3: 'info',
  4: 'hint',
};

export interface LSPClientOptions {
  flowCommand?: string;
  network?: string;
  cwd?: string;
  /** Path to a standalone LSP binary (e.g. lsp-v2). If set, spawns it directly instead of `flow cadence language-server`. */
  lspBinary?: string;
}

export class CadenceLSPClient extends EventEmitter {
  private process: ChildProcess | null = null;
  private pendingRequests = new Map<number, PendingRequest>();
  private nextId = 1;
  private buffer = Buffer.alloc(0);
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private flowCommand: string;
  private network: string;
  private cwd?: string;
  private lspBinary?: string;

  constructor(flowCommandOrOpts: string | LSPClientOptions = 'flow') {
    super();
    if (typeof flowCommandOrOpts === 'string') {
      this.flowCommand = flowCommandOrOpts;
      this.network = 'mainnet';
    } else {
      this.flowCommand = flowCommandOrOpts.flowCommand ?? 'flow';
      this.network = flowCommandOrOpts.network ?? 'mainnet';
      this.cwd = flowCommandOrOpts.cwd;
      this.lspBinary = flowCommandOrOpts.lspBinary;
    }
  }

  async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      if (this.lspBinary) {
        // Spawn standalone LSP binary (v2) — root-dir defaults to CWD
        console.error(`[LSP] spawning v2 binary: ${this.lspBinary} cwd=${this.cwd}`);
        this.process = spawn(this.lspBinary, [], {
          stdio: ['pipe', 'pipe', 'pipe'],
          ...(this.cwd ? { cwd: this.cwd } : {}),
        });
      } else {
        // Spawn via Flow CLI (v1)
        this.process = spawn(this.flowCommand, ['cadence', 'language-server', '--enable-flow-client=false'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          ...(this.cwd ? { cwd: this.cwd } : {}),
        });
      }
    } catch (e: any) {
      throw new Error(`Failed to start LSP: ${e.message}`);
    }

    // Handle spawn error (e.g. executable not found)
    await new Promise<void>((resolve, reject) => {
      this.process!.on('error', (err) => reject(new Error(`Failed to start Flow CLI: ${err.message}`)));
      this.process!.on('spawn', () => resolve());
    });

    this.process.stdout!.on('data', (data: Buffer) => this.onData(data));
    this.process.stderr!.on('data', (data: Buffer) => {
      console.error('[LSP stderr]', data.toString());
    });

    this.process.on('exit', (code) => {
      console.error(`[LSP] process exited with code ${code}`);
      this.initialized = false;
      this.initPromise = null;
      for (const [, req] of this.pendingRequests) {
        req.reject(new Error('LSP process exited'));
        clearTimeout(req.timer);
      }
      this.pendingRequests.clear();
    });

    await this.request('initialize', {
      processId: process.pid,
      capabilities: {
        textDocument: {
          hover: { contentFormat: ['markdown', 'plaintext'] },
          definition: {},
          references: {},
          documentSymbol: {},
          publishDiagnostics: {},
        },
      },
      rootUri: this.cwd ? `file://${this.cwd}` : null,
      workspaceFolders: null,
      initializationOptions: {
        accessCheckMode: 'strict',
      },
    });

    this.notify('initialized', {});
    this.initialized = true;
  }

  private onData(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data]);
    while (this.tryParseMessage()) {}
  }

  private tryParseMessage(): boolean {
    const headerEnd = this.buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return false;

    const header = this.buffer.subarray(0, headerEnd).toString('ascii');
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) return false;

    const contentLength = parseInt(match[1], 10);
    const bodyStart = headerEnd + 4;
    if (this.buffer.length < bodyStart + contentLength) return false;

    const body = this.buffer.subarray(bodyStart, bodyStart + contentLength).toString('utf-8');
    this.buffer = this.buffer.subarray(bodyStart + contentLength);

    try {
      const message = JSON.parse(body);
      this.handleMessage(message);
    } catch (e) {
      console.error('[LSP] Failed to parse message:', e);
    }

    return true;
  }

  private handleMessage(message: any): void {
    if ('id' in message && message.id !== undefined) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        this.pendingRequests.delete(message.id);
        clearTimeout(pending.timer);
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
      }
      return;
    }

    if (message.method) {
      this.emit('notification', message.method, message.params);
      this.emit(message.method, message.params);
    }
  }

  async request(method: string, params: any, timeoutMs = 30000): Promise<any> {
    if (method !== 'initialize') {
      await this.ensureInitialized();
    }

    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`LSP request '${method}' timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });
      this.send({ jsonrpc: '2.0', id, method, params });
    });
  }

  notify(method: string, params: any): void {
    this.send({ jsonrpc: '2.0', method, params });
  }

  private send(message: any): void {
    if (!this.process?.stdin?.writable) {
      throw new Error('LSP process not available');
    }
    const body = JSON.stringify(message);
    const contentLength = Buffer.byteLength(body, 'utf-8');
    this.process.stdin.write(`Content-Length: ${contentLength}\r\n\r\n${body}`);
  }

  async shutdown(): Promise<void> {
    if (!this.process || this.process.killed) return;
    try {
      await this.request('shutdown', null, 5000);
      this.notify('exit', null);
    } catch {
      this.process.kill();
    }
  }

  // --- High-level API ---

  async openDocument(uri: string, content: string): Promise<void> {
    await this.ensureInitialized();
    this.notify('textDocument/didOpen', {
      textDocument: { uri, languageId: 'cadence', version: 1, text: content },
    });
  }

  async closeDocument(uri: string): Promise<void> {
    this.notify('textDocument/didClose', {
      textDocument: { uri },
    });
  }

  async hover(uri: string, line: number, character: number): Promise<any> {
    return this.request('textDocument/hover', {
      textDocument: { uri },
      position: { line, character },
    });
  }

  async definition(uri: string, line: number, character: number): Promise<any> {
    return this.request('textDocument/definition', {
      textDocument: { uri },
      position: { line, character },
    });
  }

  async documentSymbols(uri: string): Promise<any> {
    return this.request('textDocument/documentSymbol', {
      textDocument: { uri },
    });
  }

  async references(uri: string, line: number, character: number): Promise<any> {
    return this.request('textDocument/references', {
      textDocument: { uri },
      position: { line, character },
      context: { includeDeclaration: true },
    });
  }

  /**
   * Open a virtual document and wait for diagnostics from the LSP.
   * Returns formatted diagnostics.
   */
  async checkCode(code: string, filename = 'check.cdc'): Promise<Diagnostic[]> {
    await this.ensureInitialized();
    const base = this.cwd ? `file://${this.cwd}` : 'file:///tmp/cadence-mcp';
    const uri = `${base}/${filename}`;

    return new Promise<Diagnostic[]>((resolve) => {
      const timeout = setTimeout(() => {
        this.removeListener('textDocument/publishDiagnostics', handler);
        this.closeDocument(uri);
        resolve([]);
      }, 10000);

      const handler = (params: any) => {
        if (params.uri === uri) {
          clearTimeout(timeout);
          this.removeListener('textDocument/publishDiagnostics', handler);
          this.closeDocument(uri);
          resolve(params.diagnostics || []);
        }
      };

      this.on('textDocument/publishDiagnostics', handler);
      this.openDocument(uri, code);
    });
  }

  /** Format diagnostics into a human/AI readable string */
  static formatDiagnostics(diagnostics: Diagnostic[]): string {
    if (diagnostics.length === 0) return 'No errors found.';

    return diagnostics
      .map((d) => {
        const severity = SEVERITY_LABELS[d.severity ?? 1] ?? 'error';
        const loc = `line ${d.range.start.line + 1}:${d.range.start.character + 1}`;
        return `[${severity}] ${loc}: ${d.message}`;
      })
      .join('\n');
  }

  /** Format hover result into readable text */
  static formatHover(result: any): string {
    if (!result?.contents) return 'No information available.';
    const contents = result.contents;
    if (typeof contents === 'string') return contents;
    if (contents.value) return contents.value;
    if (Array.isArray(contents)) {
      return contents
        .map((c: any) => (typeof c === 'string' ? c : c.value || ''))
        .filter(Boolean)
        .join('\n\n');
    }
    return JSON.stringify(contents);
  }

  /** Format document symbols into readable text */
  static formatSymbols(symbols: any[], indent = 0): string {
    if (!symbols?.length) return 'No symbols found.';

    const lines: string[] = [];
    for (const sym of symbols) {
      const kindName = SYMBOL_KINDS[sym.kind] ?? `kind(${sym.kind})`;
      const prefix = '  '.repeat(indent);
      const detail = sym.detail ? ` — ${sym.detail}` : '';
      lines.push(`${prefix}${kindName} ${sym.name}${detail}`);
      if (sym.children?.length) {
        lines.push(CadenceLSPClient.formatSymbols(sym.children, indent + 1));
      }
    }
    return lines.join('\n');
  }
}

export const VALID_NETWORKS = ['mainnet', 'testnet', 'emulator'] as const;
export type FlowNetwork = (typeof VALID_NETWORKS)[number];

/**
 * Manages LSP client + a persistent deps workspace for checking code
 * with mainnet/testnet address imports.
 */
export class LSPManager {
  private clients = new Map<string, CadenceLSPClient>();
  private flowCommand: string;
  private lspBinary?: string;
  private depsWorkspaces = new Map<string, DepsWorkspace>();

  constructor(flowCommand = 'flow', lspBinary?: string) {
    this.flowCommand = flowCommand;
    this.lspBinary = lspBinary;
  }

  async getClient(network: FlowNetwork = 'mainnet'): Promise<CadenceLSPClient> {
    let client = this.clients.get(network);
    if (client) return client;

    // Start LSP client inside the DepsWorkspace so it finds flow.json
    const ws = await this.getDepsWorkspace(network);
    client = new CadenceLSPClient({
      flowCommand: this.flowCommand,
      network,
      cwd: ws.getDir(),
      lspBinary: this.lspBinary,
    });
    await client.ensureInitialized();
    this.clients.set(network, client);
    return client;
  }

  private async getDepsWorkspace(network: FlowNetwork): Promise<DepsWorkspace> {
    let ws = this.depsWorkspaces.get(network);
    if (!ws) {
      ws = new DepsWorkspace(this.flowCommand, network);
      await ws.init();
      this.depsWorkspaces.set(network, ws);
    }
    return ws;
  }

  /**
   * Prepare code with address imports: install deps, rewrite to string imports.
   * Returns the (possibly rewritten) code and the workspace-relative URI.
   */
  private async prepareCode(
    code: string,
    network: FlowNetwork,
    filename: string,
  ): Promise<{ code: string; uri: string }> {
    const ws = await this.getDepsWorkspace(network);

    if (hasAddressImports(code) && network !== 'emulator') {
      const imports = extractAddressImports(code);
      await ws.installDeps(imports);
      code = rewriteToStringImports(code);
    }

    const uri = `file://${ws.getDir()}/${filename}`;
    return { code, uri };
  }

  /** Check code for diagnostics, transparently handling address imports */
  async checkCode(code: string, network: FlowNetwork = 'mainnet', filename = 'check.cdc'): Promise<Diagnostic[]> {
    const prepared = await this.prepareCode(code, network, filename);
    console.error(`[LSPManager] checking code (${prepared.code.length} bytes), uri=${prepared.uri}`);
    console.error(`[LSPManager] rewritten code preview: ${prepared.code.substring(0, 200)}`);
    const client = await this.getClient(network);
    const diags = await client.checkCode(prepared.code, filename);
    console.error(`[LSPManager] got ${diags.length} diagnostics`);
    return diags;
  }

  /** Get hover info, transparently handling address imports */
  async hover(code: string, network: FlowNetwork, line: number, character: number, filename = 'hover.cdc'): Promise<any> {
    const prepared = await this.prepareCode(code, network, filename);
    const client = await this.getClient(network);
    await client.openDocument(prepared.uri, prepared.code);
    try {
      return await client.hover(prepared.uri, line, character);
    } finally {
      await client.closeDocument(prepared.uri);
    }
  }

  /** Get definition location, transparently handling address imports */
  async definition(code: string, network: FlowNetwork, line: number, character: number, filename = 'def.cdc'): Promise<any> {
    const prepared = await this.prepareCode(code, network, filename);
    const client = await this.getClient(network);
    await client.openDocument(prepared.uri, prepared.code);
    try {
      return await client.definition(prepared.uri, line, character);
    } finally {
      await client.closeDocument(prepared.uri);
    }
  }

  /** Get document symbols, transparently handling address imports */
  async symbols(code: string, network: FlowNetwork, filename = 'symbols.cdc'): Promise<any> {
    const prepared = await this.prepareCode(code, network, filename);
    const client = await this.getClient(network);
    await client.openDocument(prepared.uri, prepared.code);
    try {
      return await client.documentSymbols(prepared.uri);
    } finally {
      await client.closeDocument(prepared.uri);
    }
  }

  async shutdown(): Promise<void> {
    for (const client of this.clients.values()) {
      await client.shutdown();
    }
    this.clients.clear();
  }
}

/** Detect if code has address imports like `import X from 0xabc123` or `import X, Y from 0xabc123` */
export function hasAddressImports(code: string): boolean {
  return /import\s+\w[\w, ]*\s+from\s+0x[0-9a-fA-F]+/m.test(code);
}

/**
 * Extract address imports, supporting both single and multi-name forms:
 *   `import FungibleToken from 0xf233dcee88fe0abe`
 *   `import TopShotMarketV3, Market from 0xc1e4f4f4c4257510`
 * Returns [{name: "FungibleToken", address: "f233dcee88fe0abe"}, ...]
 */
export function extractAddressImports(code: string): { name: string; address: string }[] {
  const imports: { name: string; address: string }[] = [];
  // Match "import <names> from 0x<address>" on a single line — use [^\n] to avoid cross-line greediness
  const re = /import\s+([\w][\w, ]*\w)\s+from\s+0x([0-9a-fA-F]+)/gm;
  let m;
  while ((m = re.exec(code)) !== null) {
    const names = m[1].split(',').map((n) => n.trim()).filter(Boolean);
    const address = m[2];
    for (const name of names) {
      imports.push({ name, address });
    }
  }
  return imports;
}

/**
 * Rewrite address imports to string imports:
 *   `import X from 0xAddr` → `import "X"`
 *   `import X, Y from 0xAddr` → `import "X"\nimport "Y"`
 */
export function rewriteToStringImports(code: string): string {
  return code.replace(
    /import\s+([\w][\w, ]*\w)\s+from\s+0x[0-9a-fA-F]+/gm,
    (_match, namesPart: string) => {
      const names = namesPart.split(',').map((n) => n.trim()).filter(Boolean);
      return names.map((n) => `import "${n}"`).join('\n');
    },
  );
}

/**
 * Persistent workspace that caches installed dependencies per network.
 * Uses `flow dependencies install` to fetch contracts from mainnet/testnet.
 */
class DepsWorkspace {
  private dir: string;
  private flowCommand: string;
  private network: FlowNetwork;
  private installedContracts = new Set<string>();

  constructor(flowCommand: string, network: FlowNetwork) {
    this.flowCommand = flowCommand;
    this.network = network;
    this.dir = join(tmpdir(), `cadence-mcp-deps-${network}`);
  }

  getDir(): string {
    return this.dir;
  }

  async init(): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const flowJsonPath = join(this.dir, 'flow.json');
    try {
      await access(flowJsonPath);
      // flow.json exists, load installed contracts from it
      const raw = await readFile(flowJsonPath, 'utf-8');
      const config = JSON.parse(raw);
      if (config.dependencies) {
        for (const name of Object.keys(config.dependencies)) {
          this.installedContracts.add(name);
        }
      }
    } catch {
      // Create fresh flow.json with network config
      await writeFile(flowJsonPath, JSON.stringify({
        networks: {
          mainnet: 'access.mainnet.nodes.onflow.org:9000',
          testnet: 'access.devnet.nodes.onflow.org:9000',
          emulator: '127.0.0.1:3569',
        },
      }, null, 2), 'utf-8');
    }
  }

  /** Install dependencies for contracts not yet cached */
  async installDeps(imports: { name: string; address: string }[]): Promise<void> {
    const missing = imports.filter((i) => !this.installedContracts.has(i.name));
    console.error(`[DepsWorkspace] installDeps: ${imports.length} total, ${missing.length} missing, dir=${this.dir}`);
    if (missing.length === 0) return;

    for (const dep of missing) {
      // Use network://0xAddress.ContractName format so the CLI can resolve any contract
      const depSpec = `${this.network}://0x${dep.address}.${dep.name}`;
      await new Promise<void>((resolve) => {
        execFile(
          this.flowCommand,
          ['dependencies', 'install', depSpec],
          { cwd: this.dir, timeout: 60000 },
          (error, _stdout, stderr) => {
            if (!error) {
              this.installedContracts.add(dep.name);
            } else {
              console.error(`[deps] Failed to install ${dep.name}: ${stderr}`);
            }
            resolve(); // Don't fail the whole check if one dep fails
          },
        );
      });
    }
  }

}


const SYMBOL_KINDS: Record<number, string> = {
  1: 'File',
  2: 'Module',
  3: 'Namespace',
  4: 'Package',
  5: 'Class',
  6: 'Method',
  7: 'Property',
  8: 'Field',
  9: 'Constructor',
  10: 'Enum',
  11: 'Interface',
  12: 'Function',
  13: 'Variable',
  14: 'Constant',
  15: 'String',
  16: 'Number',
  17: 'Boolean',
  18: 'Array',
  19: 'Object',
  20: 'Key',
  21: 'Null',
  22: 'EnumMember',
  23: 'Struct',
  24: 'Event',
  25: 'Operator',
  26: 'TypeParameter',
};
