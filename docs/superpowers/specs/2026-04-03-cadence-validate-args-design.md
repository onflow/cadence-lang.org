# Cadence Validate Args — MCP Tool Design

**Date:** 2026-04-03
**Status:** Draft
**Scope:** Add `cadence_validate_args` tool to `@outblock/cadence-mcp`

## Summary

Add a single new MCP tool `cadence_validate_args` that validates JSON-CDC encoded arguments. Supports two modes:

1. **Standalone** — validate JSON-CDC format, type names, and value correctness
2. **With source code** — additionally verify arguments match the script/transaction function signature via LSP

Primary consumer: AI agents building transaction/script parameters for Flow blockchain.

## Motivation

AI agents constructing Cadence transaction arguments frequently produce malformed JSON-CDC — wrong type names, out-of-range values, mismatched parameter counts. Currently the only way to catch these errors is to execute the script and get a cryptic Flow CLI error. A dedicated validation tool lets agents self-check before execution.

## Tool API

### `cadence_validate_args`

**Parameters:**

```typescript
{
  args: z.array(z.string())
    .describe('JSON-CDC encoded arguments, each a JSON string e.g. \'{"type":"UInt8","value":"123"}\''),
  code: z.string().optional()
    .describe('Cadence script or transaction source code. If provided, validates args match the entry function signature.'),
  network: z.enum(['mainnet', 'testnet', 'emulator']).optional().default('mainnet')
    .describe('Flow network. Only used when code is provided (for LSP analysis).')
}
```

**Response — valid:**

```json
{
  "valid": true,
  "args": [
    { "index": 0, "type": "Address", "value": "0x1654653399040a61" },
    { "index": 1, "type": "UFix64", "value": "10.50000000" }
  ],
  "parameters": [
    { "name": "recipient", "type": "Address", "index": 0 },
    { "name": "amount", "type": "UFix64", "index": 1 }
  ]
}
```

> `parameters` field is only present when `code` is provided.

**Response — invalid:**

```json
{
  "valid": false,
  "errors": [
    "Arg 0: UInt8 value 256 out of range [0, 255]",
    "Arg 1: invalid Address format, expected 0x-prefixed hex string"
  ],
  "args": [
    { "index": 0, "type": "UInt8", "value": "256", "error": "value 256 out of range [0, 255]" },
    { "index": 1, "type": "Address", "value": "not-hex", "error": "invalid Address format, expected 0x-prefixed hex string" }
  ]
}
```

**Response — signature mismatch (with code):**

```json
{
  "valid": false,
  "errors": [
    "Expected 2 arguments, got 3",
    "Arg 1 (amount): expected UFix64, got String"
  ],
  "parameters": [
    { "name": "recipient", "type": "Address", "index": 0 },
    { "name": "amount", "type": "UFix64", "index": 1 }
  ],
  "args": [
    { "index": 0, "type": "Address", "value": "0x1654653399040a61" },
    { "index": 1, "type": "String", "value": "hello", "error": "expected UFix64, got String" },
    { "index": 2, "type": "Bool", "value": "true", "error": "unexpected extra argument" }
  ]
}
```

## Validation Rules

### Mode 1: Standalone (no code)

For each arg in `args`:

1. **JSON structure** — must parse as valid JSON with `type` (string) and `value` fields
2. **Type name** — must be a recognized Cadence type (see V1 type list below)
3. **Value rules per type:**

| Type | Rule |
|------|------|
| `Bool` | value must be `true` or `false` (boolean) |
| `String` | value must be a string |
| `Character` | value must be a single-character string |
| `Address` | value must match `/^0x[0-9a-fA-F]{1,16}$/` |
| `Int`, `UInt` | value must be a decimal integer string |
| `Int8`..`Int256` | value must be decimal integer string within signed range |
| `UInt8`..`UInt256` | value must be decimal integer string within unsigned range |
| `Word8`..`Word256` | value must be decimal integer string within unsigned range |
| `Fix64` | value must be decimal string with ≤ 8 decimal places, within `[-92233720368.54775808, 92233720368.54775807]` |
| `UFix64` | value must be non-negative decimal string with ≤ 8 decimal places, within `[0.0, 184467440737.09551615]` |
| `Optional` | value is `null` (None) or a valid JSON-CDC value (Some) |
| `Array` | value must be an array of valid JSON-CDC values |
| `Dictionary` | value must be an array of `{ "key": <JSON-CDC>, "value": <JSON-CDC> }` objects |

### Mode 2: With source code

1. Run all standalone validations above
2. Send `code` to LSP via existing `LSPManager`
3. Extract entry function signature:
   - For scripts: `access(all) fun main(...)` parameters
   - For transactions: `transaction(...)` declaration parameters
4. Verify argument count matches parameter count
5. Verify each arg's JSON-CDC type is compatible with the corresponding parameter type

### V1 Supported Types

**Integers:** `Int`, `UInt`, `Int8`, `Int16`, `Int32`, `Int64`, `Int128`, `Int256`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `UInt128`, `UInt256`, `Word8`, `Word16`, `Word32`, `Word64`, `Word128`, `Word256`

**Fixed-point:** `Fix64`, `UFix64`

**Basic:** `Bool`, `String`, `Character`, `Address`

**Composite:** `Optional`, `Array`, `Dictionary`

**V2 (future):** `Struct`, `Resource`, `Enum`, `Event`, `Path`, `Capability`, `Type`, `InclusiveRange`

Unrecognized types in V1 produce a warning, not an error — allows forward compatibility with newer Cadence types.

## Architecture

### New Files

```
mcp-server/src/
├── codec/
│   ├── types.ts             # Type definitions, range constants, type registry
│   ├── validate.ts          # JSON-CDC validation logic (~200 lines)
│   ├── validate.test.ts     # Unit tests — FCL ground truth fixtures
│   └── fixtures/
│       ├── generate.mjs     # Dev script: uses FCL to generate expected.json
│       └── expected.json    # FCL-generated ground truth fixtures
├── server.ts                # Add cadence_validate_args tool registration
```

### Integration Points

- **server.ts** — register `cadence_validate_args` following existing tool pattern (`server.tool(...)`)
- **LSPManager** — reuse existing `getLSPClient()` for signature extraction (mode 2 only)
- **No new dependencies** — validation logic is pure TypeScript, FCL only in dev fixture generation

### Codec Module (`codec/`)

**`types.ts`** — type registry with validation metadata:

```typescript
interface IntegerTypeInfo {
  kind: 'integer'
  min: bigint | null   // null = unbounded
  max: bigint | null
  unsigned: boolean
}

interface FixedPointTypeInfo {
  kind: 'fixed'
  decimals: 8
  signed: boolean
  min: string
  max: string
}

interface SimpleTypeInfo {
  kind: 'simple'
  validate: (value: unknown) => string | null  // null = valid, string = error
}

interface CompositeTypeInfo {
  kind: 'composite'
  validate: (value: unknown, recurse: Validator) => string | null
}

type TypeInfo = IntegerTypeInfo | FixedPointTypeInfo | SimpleTypeInfo | CompositeTypeInfo

const TYPE_REGISTRY: Record<string, TypeInfo> = { ... }
```

**`validate.ts`** — main validation function:

```typescript
interface ValidationResult {
  valid: boolean
  errors: string[]
  args: ArgResult[]
  parameters?: ParameterInfo[]  // only when code provided
}

// Standalone validation
function validateArgs(args: string[]): ValidationResult

// With source code (async — calls LSP)
async function validateArgsWithCode(
  args: string[],
  code: string,
  lspManager: LSPManager,
  network: string
): Promise<ValidationResult>
```

### Signature Extraction via LSP

Use existing LSP infrastructure to extract entry function parameters:

1. Send the code to LSP (reuse `check` or `hover` flow from existing tools)
2. Use `textDocument/documentSymbol` to find the entry function
3. Use `textDocument/hover` on the function to get parameter types
4. Parse the hover result to extract `(paramName: Type, ...)` signature

Fallback: if LSP is unavailable, attempt regex extraction of `fun main(...)` / `transaction(...)` signatures. This is less robust but covers the case where LSP binary is not installed.

## Testing

### Strategy

Use FCL (`@onflow/types`) as ground truth. A `generate.mjs` dev script produces `expected.json` with known-valid and known-invalid JSON-CDC for every V1 type.

### Fixture Generation (`generate.mjs`)

Dev-time only script (not bundled). Installed as devDependency:

```json
{
  "devDependencies": {
    "@onflow/fcl": "^1.21.10",
    "@onflow/types": "^1.5.0"
  }
}
```

Generates fixtures for:

| Category | Cases |
|----------|-------|
| Integer types (×20) | zero, positive, min, max boundary |
| Fix64 / UFix64 | integer, decimal, zero, max precision, boundary |
| Bool | true, false |
| String | empty, ascii, unicode, emoji |
| Character | single char, unicode char |
| Address | standard, short, padded |
| Optional | null, some(primitive), some(array) |
| Array | empty, primitives, nested arrays |
| Dictionary | empty, string keys, nested values |

### Test Files

**`validate.test.ts`** — tests organized by:

1. **FCL parity (valid args):** for each fixture in `expected.json`, validate returns `valid: true`
2. **Type validation errors:** out-of-range integers, bad address format, wrong decimal places, type mismatches in arrays/dicts
3. **JSON structure errors:** missing `type` field, missing `value` field, invalid JSON string
4. **Signature matching (with code):** correct args pass, wrong count fails, wrong types fail, empty args for no-param script passes
5. **Unknown types:** unrecognized type name produces warning, not hard error

### Coverage Target

100% of V1 type validation paths covered. Every type × (valid, boundary, invalid) tested.

## Error Message Design

Error messages are optimized for AI agent consumption — specific, actionable, include expected vs actual:

```
// Good
"Arg 0: UInt8 value 256 out of range [0, 255]"
"Arg 1: Address must be 0x-prefixed hex string, got 'not-hex'"
"Arg 2: UFix64 allows max 8 decimal places, got 10"
"Expected 2 arguments (recipient: Address, amount: UFix64), got 3"

// Bad (too vague)
"Invalid argument"
"Type error"
```

## Scope Boundaries

**In scope:**
- JSON-CDC format and type validation
- LSP-based signature extraction and matching
- V1 types (primitives + Optional/Array/Dictionary)
- FCL-aligned test fixtures
- AI-friendly error messages

**Out of scope (V2):**
- Struct/Resource/Enum/Event/Path/Capability/Type/InclusiveRange validation
- JSON-CDC encoding (constructing JSON-CDC from raw values)
- JSON-CDC decoding (converting JSON-CDC to JS values)
- Transaction building or signing
