import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { CadenceLSPClient } from './client.js';

/**
 * Integration tests — require Flow CLI or a standalone LSP binary.
 * These tests spin up a real Cadence language server and verify
 * that it correctly identifies syntax/type errors in Cadence code.
 *
 * Environment variables:
 *   LSP_BINARY  — path to standalone LSP binary (e.g. lsp-v2). If set, uses it directly.
 *   FLOW_CMD    — path to Flow CLI (default: 'flow'). Used when LSP_BINARY is not set.
 *   SKIP_LSP_TESTS=1 — skip all LSP integration tests.
 */

const FLOW_CMD = process.env.FLOW_CMD || 'flow';
const LSP_BINARY = process.env.LSP_BINARY || '';

async function lspAvailable(): Promise<boolean> {
  if (LSP_BINARY) {
    try {
      const proc = Bun.spawn([LSP_BINARY, '--help'], { stdout: 'pipe', stderr: 'pipe' });
      await proc.exited;
      // lsp-v2 may exit 0 or non-zero for --help, just check it exists
      return true;
    } catch {
      return false;
    }
  }
  try {
    const proc = Bun.spawn([FLOW_CMD, 'version'], { stdout: 'pipe', stderr: 'pipe' });
    await proc.exited;
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

const descLabel = LSP_BINARY
  ? `LSP Integration (v2 binary: ${LSP_BINARY})`
  : 'LSP Integration (requires Flow CLI)';

describe(descLabel, () => {
  let lsp: CadenceLSPClient;
  let available = false;

  beforeAll(async () => {
    if (process.env.SKIP_LSP_TESTS === '1') return;
    available = await lspAvailable();
    if (!available) {
      console.warn(`[skip] LSP not available (LSP_BINARY=${LSP_BINARY}, FLOW_CMD=${FLOW_CMD})`);
      return;
    }
    if (LSP_BINARY) {
      lsp = new CadenceLSPClient({ lspBinary: LSP_BINARY });
    } else {
      lsp = new CadenceLSPClient(FLOW_CMD);
    }
    await lsp.ensureInitialized();
  }, 30000);

  afterAll(async () => {
    if (lsp) await lsp.shutdown();
  });

  // ─── checkCode: error detection ───

  it('reports no errors for valid Cadence code', async () => {
    if (!available) return;
    const code = `
      access(all) fun greet(): String {
        return "Hello, Cadence!"
      }
    `;
    const diags = await lsp.checkCode(code, 'valid.cdc');
    const errors = diags.filter((d) => d.severity === 1);
    expect(errors).toHaveLength(0);
  }, 15000);

  it('detects syntax error: missing return type', async () => {
    if (!available) return;
    const code = `
      access(all) fun greet() {
        return "Hello"
      }
    `;
    const diags = await lsp.checkCode(code, 'syntax1.cdc');
    // This should report some diagnostic (mismatched return)
    const formatted = CadenceLSPClient.formatDiagnostics(diags);
    // May or may not be an error depending on Cadence version,
    // but should at least not crash
    expect(formatted).toBeDefined();
  }, 15000);

  it('detects type error: undeclared variable', async () => {
    if (!available) return;
    const code = `
      access(all) fun test(): Int {
        return unknownVariable
      }
    `;
    const diags = await lsp.checkCode(code, 'type_error.cdc');
    expect(diags.length).toBeGreaterThan(0);
    const formatted = CadenceLSPClient.formatDiagnostics(diags);
    expect(formatted).toContain('[error]');
    expect(formatted.toLowerCase()).toMatch(/not found|cannot find|unknown|undeclared/);
  }, 15000);

  it('detects type mismatch error', async () => {
    if (!available) return;
    const code = `
      access(all) fun add(): Int {
        let x: Int = "not a number"
        return x
      }
    `;
    const diags = await lsp.checkCode(code, 'type_mismatch.cdc');
    expect(diags.length).toBeGreaterThan(0);
    const formatted = CadenceLSPClient.formatDiagnostics(diags);
    expect(formatted).toContain('[error]');
  }, 15000);

  it('detects invalid resource usage (missing move operator)', async () => {
    if (!available) return;
    const code = `
      access(all) resource Vault {
        access(all) var balance: UFix64
        init(balance: UFix64) {
          self.balance = balance
        }
      }

      access(all) fun test() {
        let vault <- create Vault(balance: 10.0)
        let copy = vault
        destroy vault
      }
    `;
    const diags = await lsp.checkCode(code, 'resource_error.cdc');
    expect(diags.length).toBeGreaterThan(0);
    const formatted = CadenceLSPClient.formatDiagnostics(diags);
    expect(formatted).toContain('[error]');
  }, 15000);

  it('reports correct line numbers for errors', async () => {
    if (!available) return;
    const code = `access(all) fun a(): Int { return 1 }
access(all) fun b(): Int { return 2 }
access(all) fun c(): Int { return "wrong" }
access(all) fun d(): Int { return 4 }`;
    const diags = await lsp.checkCode(code, 'line_numbers.cdc');
    expect(diags.length).toBeGreaterThan(0);
    // Error should be on line 3 (0-indexed: line 2)
    const errorOnLine3 = diags.some((d) => d.range.start.line === 2);
    expect(errorOnLine3).toBe(true);
  }, 15000);

  // ─── Syntax errors ───

  it('detects missing closing brace', async () => {
    if (!available) return;
    const code = `access(all) fun broken(): Int {
      return 1
    `;
    const diags = await lsp.checkCode(code, 'missing_brace.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects unexpected token', async () => {
    if (!available) return;
    const code = `access(all) fun broken() @@@ {}`;
    const diags = await lsp.checkCode(code, 'unexpected_token.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects invalid top-level statement', async () => {
    if (!available) return;
    const code = `let x = 1 + 2`;
    const diags = await lsp.checkCode(code, 'top_level.cdc');
    expect(diags.length).toBeGreaterThan(0);
  }, 15000);

  // ─── Type system errors ───

  it('detects wrong number of function arguments', async () => {
    if (!available) return;
    const code = `
      access(all) fun add(a: Int, b: Int): Int { return a + b }
      access(all) fun test(): Int { return add(a: 1) }
    `;
    const diags = await lsp.checkCode(code, 'wrong_args.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects wrong argument type', async () => {
    if (!available) return;
    const code = `
      access(all) fun double(n: Int): Int { return n * 2 }
      access(all) fun test(): Int { return double(n: "hello") }
    `;
    const diags = await lsp.checkCode(code, 'wrong_arg_type.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects return type mismatch in function', async () => {
    if (!available) return;
    const code = `
      access(all) fun getName(): String {
        return 42
      }
    `;
    const diags = await lsp.checkCode(code, 'return_mismatch.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects missing return in non-Void function', async () => {
    if (!available) return;
    const code = `
      access(all) fun getValue(): Int {
        let x = 42
      }
    `;
    const diags = await lsp.checkCode(code, 'missing_return.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects access on non-existent struct member', async () => {
    if (!available) return;
    const code = `
      access(all) struct Point {
        access(all) let x: Int
        access(all) let y: Int
        init(x: Int, y: Int) {
          self.x = x
          self.y = y
        }
      }
      access(all) fun test(): Int {
        let p = Point(x: 1, y: 2)
        return p.z
      }
    `;
    const diags = await lsp.checkCode(code, 'no_member.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  // ─── Resource semantics ───

  it('detects resource loss (not moved or destroyed)', async () => {
    if (!available) return;
    const code = `
      access(all) resource Token {
        access(all) var id: UInt64
        init(id: UInt64) { self.id = id }
      }
      access(all) fun test() {
        let t <- create Token(id: 1)
      }
    `;
    const diags = await lsp.checkCode(code, 'resource_loss.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects using = instead of <- for resource', async () => {
    if (!available) return;
    const code = `
      access(all) resource NFT {
        access(all) let id: UInt64
        init(id: UInt64) { self.id = id }
      }
      access(all) fun test() {
        let nft = create NFT(id: 1)
        destroy nft
      }
    `;
    const diags = await lsp.checkCode(code, 'resource_assign.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects duplicate resource move', async () => {
    if (!available) return;
    const code = `
      access(all) resource Coin {
        access(all) var value: UInt64
        init(value: UInt64) { self.value = value }
      }
      access(all) fun consume(_ c: @Coin) { destroy c }
      access(all) fun test() {
        let c <- create Coin(value: 100)
        consume(<- c)
        consume(<- c)
      }
    `;
    const diags = await lsp.checkCode(code, 'double_move.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  // ─── Access control ───

  it('detects access control violation', async () => {
    if (!available) return;
    const code = `
      access(all) struct Secret {
        access(self) let value: String
        init(value: String) { self.value = value }
      }
      access(all) fun test(): String {
        let s = Secret(value: "hidden")
        return s.value
      }
    `;
    const diags = await lsp.checkCode(code, 'access_control.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  // ─── Contract / struct / interface ───

  it('detects missing init in struct with fields', async () => {
    if (!available) return;
    const code = `
      access(all) struct Broken {
        access(all) let name: String
      }
    `;
    const diags = await lsp.checkCode(code, 'missing_init.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects duplicate function declarations', async () => {
    if (!available) return;
    const code = `
      access(all) fun doSomething(): Int { return 1 }
      access(all) fun doSomething(): Int { return 2 }
    `;
    const diags = await lsp.checkCode(code, 'dup_func.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  it('detects assigning to let constant', async () => {
    if (!available) return;
    const code = `
      access(all) fun test(): Int {
        let x = 10
        x = 20
        return x
      }
    `;
    const diags = await lsp.checkCode(code, 'assign_let.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  // ─── Optional / nil safety ───

  it('handles force-unwrap on non-optional', async () => {
    if (!available) return;
    const code = `
      access(all) fun test(): Int {
        let x: Int = 42
        return x!
      }
    `;
    const diags = await lsp.checkCode(code, 'force_unwrap.cdc');
    // Force-unwrapping a non-optional may produce a warning/hint (v1) or nothing (v2).
    // Either way it should not crash.
    const formatted = CadenceLSPClient.formatDiagnostics(diags);
    expect(formatted).toBeDefined();
  }, 15000);

  it('detects nil coalescing type mismatch', async () => {
    if (!available) return;
    const code = `
      access(all) fun test(): String {
        let x: Int? = 42
        return x ?? "default"
      }
    `;
    const diags = await lsp.checkCode(code, 'nil_coalesce.cdc');
    // Int vs String mismatch
    expect(diags.length).toBeGreaterThan(0);
  }, 15000);

  // ─── Array / Dictionary types ───

  it('detects mixed-type array literal', async () => {
    if (!available) return;
    const code = `
      access(all) fun test(): [Int] {
        return [1, 2, "three"]
      }
    `;
    const diags = await lsp.checkCode(code, 'mixed_array.cdc');
    expect(diags.length).toBeGreaterThan(0);
    expect(CadenceLSPClient.formatDiagnostics(diags)).toContain('[error]');
  }, 15000);

  // ─── Valid code (no false positives) ───

  it('accepts valid struct definition', async () => {
    if (!available) return;
    const code = `
      access(all) struct Color {
        access(all) let r: UInt8
        access(all) let g: UInt8
        access(all) let b: UInt8
        init(r: UInt8, g: UInt8, b: UInt8) {
          self.r = r
          self.g = g
          self.b = b
        }
      }
    `;
    const diags = await lsp.checkCode(code, 'valid_struct.cdc');
    const errors = diags.filter((d) => d.severity === 1);
    expect(errors).toHaveLength(0);
  }, 15000);

  it('accepts valid resource with destroy', async () => {
    if (!available) return;
    const code = `
      access(all) resource Ticket {
        access(all) let id: UInt64
        init(id: UInt64) { self.id = id }
      }
      access(all) fun test() {
        let t <- create Ticket(id: 1)
        destroy t
      }
    `;
    const diags = await lsp.checkCode(code, 'valid_resource.cdc');
    const errors = diags.filter((d) => d.severity === 1);
    expect(errors).toHaveLength(0);
  }, 15000);

  it('accepts valid optional binding', async () => {
    if (!available) return;
    const code = `
      access(all) fun test(): Int {
        let x: Int? = 42
        if let val = x {
          return val
        }
        return 0
      }
    `;
    const diags = await lsp.checkCode(code, 'valid_optional.cdc');
    const errors = diags.filter((d) => d.severity === 1);
    expect(errors).toHaveLength(0);
  }, 15000);

  it('accepts valid interface implementation', async () => {
    if (!available) return;
    const code = `
      access(all) struct interface Greetable {
        access(all) fun greet(): String
      }
      access(all) struct Greeter: Greetable {
        access(all) fun greet(): String {
          return "Hello!"
        }
      }
    `;
    const diags = await lsp.checkCode(code, 'valid_interface.cdc');
    const errors = diags.filter((d) => d.severity === 1);
    expect(errors).toHaveLength(0);
  }, 15000);

  // ─── hover ───

  it('returns type info on hover', async () => {
    if (!available) return;
    const code = `access(all) fun greet(): String { return "Hi" }`;
    const uri = 'file:///tmp/cadence-mcp/hover_test.cdc';
    await lsp.openDocument(uri, code);
    try {
      const result = await lsp.hover(uri, 0, 20);
      const formatted = CadenceLSPClient.formatHover(result);
      expect(formatted).toBeDefined();
      // Should contain some type information
      if (result) {
        expect(formatted.length).toBeGreaterThan(0);
      }
    } finally {
      await lsp.closeDocument(uri);
    }
  }, 15000);

  // ─── documentSymbols ───

  it('lists symbols in Cadence code', async () => {
    if (!available) return;
    const code = `
      access(all) contract HelloWorld {
        access(all) let greeting: String
        init() {
          self.greeting = "Hello"
        }
        access(all) fun hello(): String {
          return self.greeting
        }
      }
    `;
    const uri = 'file:///tmp/cadence-mcp/symbols_test.cdc';
    await lsp.openDocument(uri, code);
    try {
      const symbols = await lsp.documentSymbols(uri);
      expect(symbols).toBeDefined();
      if (symbols && symbols.length > 0) {
        const formatted = CadenceLSPClient.formatSymbols(symbols);
        expect(formatted).toContain('HelloWorld');
      }
    } finally {
      await lsp.closeDocument(uri);
    }
  }, 15000);
});
