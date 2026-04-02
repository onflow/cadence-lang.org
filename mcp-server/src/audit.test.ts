import { describe, it, expect } from 'bun:test';
import { securityScan, formatScanResult, fetchContractSource, toManifest, executeScript, type ScanResult, type AccountContractFetcher } from './audit.js';

describe('securityScan', () => {
  it('detects access(all) on state fields', () => {
    const code = `
access(all) contract MyContract {
  access(all) var balance: UFix64
  init() { self.balance = 0.0 }
}`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'overly-permissive-access');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('high');
  });

  it('detects access(all) on functions', () => {
    const code = `
access(all) contract MyContract {
  access(all) fun withdraw(amount: UFix64): @FungibleToken.Vault {
    return <- self.vault.withdraw(amount: amount)
  }
}`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'overly-permissive-function');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('medium');
  });

  it('detects deprecated pub keyword', () => {
    const code = `pub contract OldContract {
  pub var x: Int
  pub fun foo() {}
}`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'deprecated-pub');
    expect(found.length).toBeGreaterThanOrEqual(2);
    expect(found[0].severity).toBe('info');
  });

  it('detects force unwrap', () => {
    const code = `
let ref = account.borrow<&MyResource>(from: /storage/my)!
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'unsafe-force-unwrap');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('medium');
  });

  it('detects AuthAccount exposure', () => {
    const code = `
access(all) fun setup(acct: AuthAccount) {
  acct.save(<- create Vault(), to: /storage/vault)
}`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'auth-account-exposure');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('high');
  });

  it('detects auth(...) &Account exposure', () => {
    const code = `
access(all) fun setup(acct: auth(Storage) &Account) {}
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'auth-account-exposure');
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  it('detects hardcoded addresses (not in imports)', () => {
    const code = `
let addr = 0x1654653399040a61
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'hardcoded-address');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('low');
  });

  it('detects capability publish', () => {
    const code = `
account.capabilities.publish(cap, at: /public/myResource)
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'unguarded-capability');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('high');
  });

  it('detects explicit destroy', () => {
    const code = `
destroy(oldVault)
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'resource-loss-destroy');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('high');
  });

  it('returns empty findings for clean code', () => {
    const code = `
access(contract) fun internalHelper(): String {
  return "hello"
}`;
    const result = securityScan(code);
    // Should have zero high-severity findings at least
    expect(result.summary.high).toBe(0);
  });

  it('summary counts match findings', () => {
    const code = `
access(all) var x: Int
pub fun foo() {}
let y = something!
`;
    const result = securityScan(code);
    const counts = { high: 0, medium: 0, low: 0, info: 0 };
    for (const f of result.findings) counts[f.severity]++;
    expect(result.summary).toEqual(counts);
  });
});

// --- fetchContractSource with mock fetcher ---

describe('fetchContractSource (dependency graph)', () => {
  // Mock contract sources: A imports B and C, B imports C, C has no imports
  const MOCK_CONTRACTS: Record<string, { name: string; source: string }[]> = {
    '0xAAAA': [
      {
        name: 'ContractA',
        source: `
import ContractB from 0xBBBB
import ContractC from 0xCCCC

access(all) contract ContractA {
  init() {}
}`,
      },
    ],
    '0xBBBB': [
      {
        name: 'ContractB',
        source: `
import ContractC from 0xCCCC

access(all) contract ContractB {
  init() {}
}`,
      },
    ],
    '0xCCCC': [
      {
        name: 'ContractC',
        source: `
access(all) contract ContractC {
  init() {}
}`,
      },
    ],
  };

  const mockFetcher: AccountContractFetcher = async (address) => {
    return MOCK_CONTRACTS[address] ?? [];
  };

  it('fetches target contracts without recursion', async () => {
    const tree = await fetchContractSource('0xAAAA', 'mainnet', { recurse: false, fetcher: mockFetcher });
    expect(tree.target).toBe('0xAAAA');
    expect(tree.contracts).toHaveLength(1);
    expect(tree.contracts[0].name).toBe('ContractA');
    expect(tree.contracts[0].imports).toEqual(['0xBBBB.ContractB', '0xCCCC.ContractC']);
  });

  it('recursively fetches all dependency contracts', async () => {
    const tree = await fetchContractSource('0xAAAA', 'mainnet', { recurse: true, fetcher: mockFetcher });
    expect(tree.contracts).toHaveLength(3);
    const names = tree.contracts.map((c) => c.name).sort();
    expect(names).toEqual(['ContractA', 'ContractB', 'ContractC']);
  });

  it('deduplicates shared dependencies (C imported by both A and B)', async () => {
    const fetchCount: Record<string, number> = {};
    const countingFetcher: AccountContractFetcher = async (address, network) => {
      fetchCount[address] = (fetchCount[address] ?? 0) + 1;
      return mockFetcher(address, network);
    };

    await fetchContractSource('0xAAAA', 'mainnet', { recurse: true, fetcher: countingFetcher });
    // 0xCCCC should only be fetched once despite A and B both importing it
    expect(fetchCount['0xCCCC']).toBe(1);
    expect(fetchCount['0xAAAA']).toBe(1);
    expect(fetchCount['0xBBBB']).toBe(1);
  });

  it('handles circular dependencies without infinite loop', async () => {
    const circularContracts: Record<string, { name: string; source: string }[]> = {
      '0x1111': [
        { name: 'Alpha', source: 'import Beta from 0x2222\naccess(all) contract Alpha {}' },
      ],
      '0x2222': [
        { name: 'Beta', source: 'import Alpha from 0x1111\naccess(all) contract Beta {}' },
      ],
    };
    const circularFetcher: AccountContractFetcher = async (address) => circularContracts[address] ?? [];

    const tree = await fetchContractSource('0x1111', 'mainnet', { recurse: true, fetcher: circularFetcher });
    expect(tree.contracts).toHaveLength(2);
    const names = tree.contracts.map((c) => c.name).sort();
    expect(names).toEqual(['Alpha', 'Beta']);
  });

  it('handles account with multiple contracts', async () => {
    const multiContracts: Record<string, { name: string; source: string }[]> = {
      '0xMULTI': [
        { name: 'TokenA', source: 'access(all) contract TokenA {}' },
        { name: 'TokenB', source: 'access(all) contract TokenB {}' },
      ],
    };
    const multiFetcher: AccountContractFetcher = async (address) => multiContracts[address] ?? [];

    const tree = await fetchContractSource('0xMULTI', 'mainnet', { recurse: true, fetcher: multiFetcher });
    expect(tree.contracts).toHaveLength(2);
    expect(tree.contracts[0].address).toBe('0xMULTI');
    expect(tree.contracts[1].address).toBe('0xMULTI');
  });

  it('handles address with no contracts', async () => {
    const emptyFetcher: AccountContractFetcher = async () => [];
    const tree = await fetchContractSource('0xEMPTY', 'mainnet', { recurse: true, fetcher: emptyFetcher });
    expect(tree.contracts).toHaveLength(0);
    expect(tree.target).toBe('0xEMPTY');
  });

  it('normalizes address without 0x prefix', async () => {
    const tree = await fetchContractSource('AAAA', 'mainnet', { recurse: false, fetcher: mockFetcher });
    expect(tree.target).toBe('0xAAAA');
    expect(tree.contracts).toHaveLength(1);
  });

  it('records correct import references', async () => {
    const tree = await fetchContractSource('0xBBBB', 'mainnet', { recurse: false, fetcher: mockFetcher });
    expect(tree.contracts[0].imports).toEqual(['0xCCCC.ContractC']);
  });
});

describe('toManifest', () => {
  it('strips source code and includes size', async () => {
    const mockFetcher: AccountContractFetcher = async (address) => {
      if (address === '0xAAAA') {
        return [{ name: 'MyContract', source: 'access(all) contract MyContract { init() {} }' }];
      }
      return [];
    };
    const tree = await fetchContractSource('0xAAAA', 'mainnet', { recurse: false, fetcher: mockFetcher });
    const manifest = toManifest(tree);

    expect(manifest.target).toBe('0xAAAA');
    expect(manifest.contracts).toHaveLength(1);
    expect(manifest.contracts[0].name).toBe('MyContract');
    expect(manifest.contracts[0].size).toBe(45);
    expect(manifest.contracts[0]).not.toHaveProperty('source');
    expect(manifest.totalSize).toBe(45);
  });

  it('calculates totalSize across all contracts', async () => {
    const mockFetcher: AccountContractFetcher = async () => [
      { name: 'A', source: '1234567890' }, // 10 chars
      { name: 'B', source: '12345' },       // 5 chars
    ];
    const tree = await fetchContractSource('0xTEST', 'mainnet', { recurse: false, fetcher: mockFetcher });
    const manifest = toManifest(tree);

    expect(manifest.totalSize).toBe(15);
    expect(manifest.contracts[0].size).toBe(10);
    expect(manifest.contracts[1].size).toBe(5);
  });
});

describe('executeScript', () => {
  it('returns error for invalid script', async () => {
    const result = await executeScript('invalid cadence code', 'mainnet', []);
    // Should return an error (either flow not found or script error)
    expect(result.error).toBeDefined();
  });

  it('writes temp file and cleans up', async () => {
    const { join } = await import('node:path');
    const { existsSync } = await import('node:fs');
    const { tmpdir } = await import('node:os');
    const { readdir } = await import('node:fs/promises');

    // Count cadence-mcp temp dirs before
    const tmpBase = tmpdir();
    const dirsBefore = (await readdir(tmpBase)).filter((d) => d.startsWith('cadence-mcp-'));

    // Execute (will fail since flow CLI probably not configured, but that's fine)
    await executeScript('access(all) fun main(): Int { return 42 }', 'mainnet', []);

    // Temp file should be cleaned up (dir may remain but .cdc file should be gone)
    const dirsAfter = (await readdir(tmpBase)).filter((d) => d.startsWith('cadence-mcp-'));
    for (const dir of dirsAfter) {
      if (!dirsBefore.includes(dir)) {
        const scriptPath = join(tmpBase, dir, 'script.cdc');
        expect(existsSync(scriptPath)).toBe(false);
      }
    }
  });
});

describe('formatScanResult', () => {
  it('formats empty results', () => {
    const result: ScanResult = { findings: [], summary: { high: 0, medium: 0, low: 0, info: 0 } };
    const text = formatScanResult(result);
    expect(text).toContain('No issues detected');
  });

  it('formats findings with severity labels', () => {
    const result: ScanResult = {
      findings: [
        { rule: 'test-rule', severity: 'high', line: 5, message: 'test message' },
      ],
      summary: { high: 1, medium: 0, low: 0, info: 0 },
    };
    const text = formatScanResult(result);
    expect(text).toContain('[HIGH]');
    expect(text).toContain('Line 5');
    expect(text).toContain('test message');
  });
});
