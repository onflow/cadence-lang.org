import { describe, it, expect } from 'bun:test';
import { createApp } from './http.js';

const app = createApp(); // no LSP manager

function post(path: string, body: unknown) {
  return app.request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/security-scan', () => {
  it('returns scan results for valid code', async () => {
    const res = await post('/api/security-scan', {
      code: `access(all) contract Test {
  access(all) var balance: UFix64
  init() { self.balance = 0.0 }
}`,
      network: 'mainnet',
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.scan).toBeDefined();
    expect(json.scan.findings.length).toBeGreaterThan(0);
    expect(json.scan.summary.high).toBeGreaterThanOrEqual(1);
    // No LSP manager, so diagnostics should be undefined
    expect(json.diagnostics).toBeUndefined();
  });

  it('returns empty findings for clean code', async () => {
    const res = await post('/api/security-scan', {
      code: `access(contract) fun helper(): String { return "ok" }`,
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.scan.summary.high).toBe(0);
  });

  it('returns 400 when code is missing', async () => {
    const res = await post('/api/security-scan', { network: 'mainnet' });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('code');
  });

  it('defaults to mainnet for invalid network', async () => {
    const res = await post('/api/security-scan', {
      code: 'access(all) var x: Int',
      network: 'invalid-net',
    });
    expect(res.status).toBe(200);
  });
});

describe('/health', () => {
  it('returns ok with lsp false', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.lsp).toBe(false);
  });
});
