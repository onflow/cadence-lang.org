import { describe, it, expect } from 'bun:test';
import { CadenceLSPClient, type Diagnostic, hasAddressImports, extractAddressImports, rewriteToStringImports } from './client.js';

// ─── Static formatters (pure, no LSP process needed) ───

describe('CadenceLSPClient.formatDiagnostics', () => {
  it('returns "No errors found." for empty array', () => {
    expect(CadenceLSPClient.formatDiagnostics([])).toBe('No errors found.');
  });

  it('formats a single error', () => {
    const diags: Diagnostic[] = [
      {
        range: { start: { line: 0, character: 4 }, end: { line: 0, character: 10 } },
        severity: 1,
        message: 'cannot find type `Foo`',
      },
    ];
    expect(CadenceLSPClient.formatDiagnostics(diags)).toBe(
      '[error] line 1:5: cannot find type `Foo`',
    );
  });

  it('formats multiple diagnostics with different severities', () => {
    const diags: Diagnostic[] = [
      {
        range: { start: { line: 2, character: 0 }, end: { line: 2, character: 5 } },
        severity: 1,
        message: 'type error',
      },
      {
        range: { start: { line: 5, character: 10 }, end: { line: 5, character: 15 } },
        severity: 2,
        message: 'unused variable',
      },
      {
        range: { start: { line: 8, character: 0 }, end: { line: 8, character: 1 } },
        severity: 3,
        message: 'info message',
      },
      {
        range: { start: { line: 10, character: 0 }, end: { line: 10, character: 1 } },
        severity: 4,
        message: 'hint message',
      },
    ];
    const result = CadenceLSPClient.formatDiagnostics(diags);
    expect(result).toContain('[error] line 3:1: type error');
    expect(result).toContain('[warning] line 6:11: unused variable');
    expect(result).toContain('[info] line 9:1: info message');
    expect(result).toContain('[hint] line 11:1: hint message');
  });

  it('defaults to "error" when severity is undefined', () => {
    const diags: Diagnostic[] = [
      {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
        message: 'unknown issue',
      },
    ];
    expect(CadenceLSPClient.formatDiagnostics(diags)).toBe(
      '[error] line 1:1: unknown issue',
    );
  });
});

describe('CadenceLSPClient.formatHover', () => {
  it('returns fallback for null result', () => {
    expect(CadenceLSPClient.formatHover(null)).toBe('No information available.');
  });

  it('returns fallback for missing contents', () => {
    expect(CadenceLSPClient.formatHover({})).toBe('No information available.');
  });

  it('handles string contents', () => {
    expect(CadenceLSPClient.formatHover({ contents: 'fun greet(): String' })).toBe(
      'fun greet(): String',
    );
  });

  it('handles MarkupContent (object with value)', () => {
    expect(
      CadenceLSPClient.formatHover({
        contents: { kind: 'markdown', value: '```cadence\nfun greet(): String\n```' },
      }),
    ).toBe('```cadence\nfun greet(): String\n```');
  });

  it('handles MarkedString array', () => {
    const result = CadenceLSPClient.formatHover({
      contents: [
        { language: 'cadence', value: 'fun greet(): String' },
        'Returns a greeting',
      ],
    });
    expect(result).toContain('fun greet(): String');
    expect(result).toContain('Returns a greeting');
  });

  it('filters empty entries from array', () => {
    const result = CadenceLSPClient.formatHover({
      contents: ['hello', { value: '' }, 'world'],
    });
    expect(result).toBe('hello\n\nworld');
  });
});

describe('CadenceLSPClient.formatSymbols', () => {
  it('returns "No symbols found." for empty array', () => {
    expect(CadenceLSPClient.formatSymbols([])).toBe('No symbols found.');
  });

  it('returns "No symbols found." for undefined', () => {
    expect(CadenceLSPClient.formatSymbols(undefined as any)).toBe('No symbols found.');
  });

  it('formats a flat list of symbols', () => {
    const symbols = [
      { name: 'HelloWorld', kind: 5, detail: 'contract' },
      { name: 'greet', kind: 12 },
    ];
    const result = CadenceLSPClient.formatSymbols(symbols);
    expect(result).toContain('Class HelloWorld — contract');
    expect(result).toContain('Function greet');
  });

  it('handles nested children', () => {
    const symbols = [
      {
        name: 'MyContract',
        kind: 5,
        children: [
          { name: 'balance', kind: 8, detail: 'UFix64' },
          { name: 'deposit', kind: 6 },
        ],
      },
    ];
    const result = CadenceLSPClient.formatSymbols(symbols);
    expect(result).toContain('Class MyContract');
    expect(result).toContain('  Field balance — UFix64');
    expect(result).toContain('  Method deposit');
  });

  it('handles unknown symbol kinds', () => {
    const symbols = [{ name: 'unknown', kind: 999 }];
    const result = CadenceLSPClient.formatSymbols(symbols);
    expect(result).toContain('kind(999) unknown');
  });
});

// ─── Import helpers ───

describe('hasAddressImports', () => {
  it('detects single-name address imports', () => {
    expect(hasAddressImports('import FungibleToken from 0xf233dcee88fe0abe')).toBe(true);
  });
  it('detects multi-name address imports', () => {
    expect(hasAddressImports('import TopShotMarketV3, Market from 0xc1e4f4f4c4257510')).toBe(true);
  });
  it('returns false for string imports', () => {
    expect(hasAddressImports('import "FungibleToken"')).toBe(false);
  });
});

describe('extractAddressImports', () => {
  it('extracts single-name address imports', () => {
    const code = 'import FungibleToken from 0xf233dcee88fe0abe\nimport NonFungibleToken from 0x1d7e57aa55817448';
    const imports = extractAddressImports(code);
    expect(imports).toHaveLength(2);
    expect(imports[0]).toEqual({ name: 'FungibleToken', address: 'f233dcee88fe0abe' });
    expect(imports[1]).toEqual({ name: 'NonFungibleToken', address: '1d7e57aa55817448' });
  });

  it('extracts multi-name address imports', () => {
    const code = 'import TopShotMarketV3, Market from 0xc1e4f4f4c4257510';
    const imports = extractAddressImports(code);
    expect(imports).toHaveLength(2);
    expect(imports[0]).toEqual({ name: 'TopShotMarketV3', address: 'c1e4f4f4c4257510' });
    expect(imports[1]).toEqual({ name: 'Market', address: 'c1e4f4f4c4257510' });
  });

  it('handles mix of single and multi-name imports', () => {
    const code = `import FungibleToken from 0xf233dcee88fe0abe
import TopShotMarketV3, Market from 0xc1e4f4f4c4257510
import NonFungibleToken from 0x1d7e57aa55817448`;
    const imports = extractAddressImports(code);
    expect(imports).toHaveLength(4);
    expect(imports.map(i => i.name)).toEqual([
      'FungibleToken', 'TopShotMarketV3', 'Market', 'NonFungibleToken',
    ]);
  });

  it('handles three or more names in one import', () => {
    const code = 'import A, B, C from 0xABCD1234ABCD1234';
    const imports = extractAddressImports(code);
    expect(imports).toHaveLength(3);
    expect(imports.map(i => i.name)).toEqual(['A', 'B', 'C']);
    expect(imports.every(i => i.address === 'ABCD1234ABCD1234')).toBe(true);
  });
});

describe('rewriteToStringImports', () => {
  it('rewrites single-name address imports', () => {
    const code = 'import FungibleToken from 0xf233dcee88fe0abe\n\naccess(all) fun main() {}';
    const result = rewriteToStringImports(code);
    expect(result).toBe('import "FungibleToken"\n\naccess(all) fun main() {}');
  });

  it('rewrites multi-name address imports to separate string imports', () => {
    const code = 'import TopShotMarketV3, Market from 0xc1e4f4f4c4257510';
    const result = rewriteToStringImports(code);
    expect(result).toBe('import "TopShotMarketV3"\nimport "Market"');
  });
});

// ─── JSON-RPC message parsing (using internal onData) ───

describe('CadenceLSPClient message parsing', () => {
  it('parses a valid JSON-RPC response and resolves pending request', async () => {
    const client = new CadenceLSPClient('nonexistent');
    // Access internals for testing message parsing
    const onData = (client as any).onData.bind(client);

    // Set up a pending request
    const promise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000);
      (client as any).pendingRequests.set(1, { resolve, reject, timer });
    });

    // Feed a JSON-RPC response
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, result: { capabilities: {} } });
    const message = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
    onData(Buffer.from(message));

    const result = await promise;
    expect(result).toEqual({ capabilities: {} });
  });

  it('handles JSON-RPC error response', async () => {
    const client = new CadenceLSPClient('nonexistent');
    const onData = (client as any).onData.bind(client);

    const promise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000);
      (client as any).pendingRequests.set(2, { resolve, reject, timer });
    });

    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      error: { code: -32600, message: 'Invalid Request' },
    });
    const message = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
    onData(Buffer.from(message));

    await expect(promise).rejects.toThrow('Invalid Request');
  });

  it('emits notifications', async () => {
    const client = new CadenceLSPClient('nonexistent');
    const onData = (client as any).onData.bind(client);

    const received = new Promise<any>((resolve) => {
      client.on('textDocument/publishDiagnostics', resolve);
    });

    const params = { uri: 'file:///test.cdc', diagnostics: [] };
    const body = JSON.stringify({
      jsonrpc: '2.0',
      method: 'textDocument/publishDiagnostics',
      params,
    });
    const message = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
    onData(Buffer.from(message));

    const result = await received;
    expect(result.uri).toBe('file:///test.cdc');
    expect(result.diagnostics).toEqual([]);
  });

  it('handles chunked messages (split across multiple data events)', async () => {
    const client = new CadenceLSPClient('nonexistent');
    const onData = (client as any).onData.bind(client);

    const promise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000);
      (client as any).pendingRequests.set(3, { resolve, reject, timer });
    });

    const body = JSON.stringify({ jsonrpc: '2.0', id: 3, result: 'chunked' });
    const full = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;

    // Split in the middle
    const mid = Math.floor(full.length / 2);
    onData(Buffer.from(full.slice(0, mid)));
    onData(Buffer.from(full.slice(mid)));

    const result = await promise;
    expect(result).toBe('chunked');
  });

  it('handles multiple messages in a single data event', async () => {
    const client = new CadenceLSPClient('nonexistent');
    const onData = (client as any).onData.bind(client);

    const promise1 = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000);
      (client as any).pendingRequests.set(10, { resolve, reject, timer });
    });
    const promise2 = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000);
      (client as any).pendingRequests.set(11, { resolve, reject, timer });
    });

    const body1 = JSON.stringify({ jsonrpc: '2.0', id: 10, result: 'first' });
    const body2 = JSON.stringify({ jsonrpc: '2.0', id: 11, result: 'second' });
    const msg1 = `Content-Length: ${Buffer.byteLength(body1)}\r\n\r\n${body1}`;
    const msg2 = `Content-Length: ${Buffer.byteLength(body2)}\r\n\r\n${body2}`;

    onData(Buffer.from(msg1 + msg2));

    expect(await promise1).toBe('first');
    expect(await promise2).toBe('second');
  });
});

// ─── send() framing ───

describe('CadenceLSPClient.send', () => {
  it('formats messages with Content-Length header', () => {
    const client = new CadenceLSPClient('nonexistent');
    let written = '';
    // Mock stdin
    (client as any).process = {
      stdin: {
        writable: true,
        write: (data: string) => { written = data; },
      },
    };

    (client as any).send({ jsonrpc: '2.0', id: 1, method: 'test', params: {} });

    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'test', params: {} });
    expect(written).toBe(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
  });

  it('throws when process is not available', () => {
    const client = new CadenceLSPClient('nonexistent');
    expect(() => (client as any).send({ jsonrpc: '2.0', method: 'test' })).toThrow(
      'LSP process not available',
    );
  });
});
