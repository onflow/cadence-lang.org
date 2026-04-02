/**
 * Cadence type registry for JSON-CDC validation.
 *
 * Defines validation metadata for all V1 Cadence types:
 * integers, fixed-point, basic types, and composite wrappers
 * (Optional, Array, Dictionary).
 *
 * Reference: JSON-Cadence Data Interchange Format v0.3.1
 * https://cadence-lang.org/docs/json-cadence-spec
 */

// ---------------------------------------------------------------------------
// JSON-CDC value shape
// ---------------------------------------------------------------------------

export interface CadenceValue {
  type: string;
  value: unknown;
}

export interface DictEntry {
  key: CadenceValue;
  value: CadenceValue;
}

// ---------------------------------------------------------------------------
// Validation result
// ---------------------------------------------------------------------------

export interface ArgResult {
  index: number;
  type: string;
  value: unknown;
  error?: string;
}

export interface ParameterInfo {
  name: string;
  type: string;
  index: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  args: ArgResult[];
  parameters?: ParameterInfo[];
}

// ---------------------------------------------------------------------------
// Type info variants
// ---------------------------------------------------------------------------

export interface IntegerTypeInfo {
  kind: 'integer';
  min: bigint | null; // null = unbounded (Int, UInt)
  max: bigint | null;
  unsigned: boolean;
}

export interface FixedPointTypeInfo {
  kind: 'fixed';
  decimals: 8;
  signed: boolean;
  min: string;
  max: string;
}

export interface SimpleTypeInfo {
  kind: 'simple';
  validate: (value: unknown) => string | null; // null = valid, string = error message
}

export interface CompositeTypeInfo {
  kind: 'composite';
  validate: (value: unknown, recurse: (v: unknown) => string | null) => string | null;
}

export type TypeInfo = IntegerTypeInfo | FixedPointTypeInfo | SimpleTypeInfo | CompositeTypeInfo;

// ---------------------------------------------------------------------------
// Integer ranges
// ---------------------------------------------------------------------------

function intRange(bits: number, signed: boolean): { min: bigint; max: bigint } {
  if (signed) {
    const half = 1n << BigInt(bits - 1);
    return { min: -half, max: half - 1n };
  }
  return { min: 0n, max: (1n << BigInt(bits)) - 1n };
}

// ---------------------------------------------------------------------------
// Simple type validators
// ---------------------------------------------------------------------------

function validateBool(value: unknown): string | null {
  if (typeof value !== 'boolean') {
    return `expected boolean, got ${typeof value}`;
  }
  return null;
}

function validateString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return `expected string, got ${typeof value}`;
  }
  return null;
}

function validateCharacter(value: unknown): string | null {
  if (typeof value !== 'string') {
    return `expected string, got ${typeof value}`;
  }
  // A Character is a single extended grapheme cluster.
  // For validation we accept any non-empty string (strict grapheme checking is complex).
  if (value.length === 0) {
    return 'Character must be a non-empty string';
  }
  return null;
}

function validateAddress(value: unknown): string | null {
  if (typeof value !== 'string') {
    return `expected string, got ${typeof value}`;
  }
  if (!/^0x[0-9a-fA-F]{1,16}$/.test(value)) {
    return `invalid Address format, expected 0x-prefixed hex string (1-16 hex chars), got '${value}'`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Composite type validators
// ---------------------------------------------------------------------------

function validateOptional(value: unknown, recurse: (v: unknown) => string | null): string | null {
  // null represents nil
  if (value === null) return null;
  // Some: must be a valid JSON-CDC value
  return recurse(value);
}

function validateArray(value: unknown, recurse: (v: unknown) => string | null): string | null {
  if (!Array.isArray(value)) {
    return `expected array, got ${typeof value}`;
  }
  for (let i = 0; i < value.length; i++) {
    const err = recurse(value[i]);
    if (err) return `element [${i}]: ${err}`;
  }
  return null;
}

function validateDictionary(value: unknown, recurse: (v: unknown) => string | null): string | null {
  if (!Array.isArray(value)) {
    return `expected array of {key, value} pairs, got ${typeof value}`;
  }
  for (let i = 0; i < value.length; i++) {
    const entry = value[i];
    if (!entry || typeof entry !== 'object' || !('key' in entry) || !('value' in entry)) {
      return `entry [${i}]: expected {key, value} object`;
    }
    const keyErr = recurse((entry as DictEntry).key);
    if (keyErr) return `entry [${i}] key: ${keyErr}`;
    const valErr = recurse((entry as DictEntry).value);
    if (valErr) return `entry [${i}] value: ${valErr}`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Build type registry
// ---------------------------------------------------------------------------

function buildRegistry(): Record<string, TypeInfo> {
  const reg: Record<string, TypeInfo> = {};

  // -- Signed integers --
  const signedSizes = [8, 16, 32, 64, 128, 256];
  for (const bits of signedSizes) {
    const { min, max } = intRange(bits, true);
    reg[`Int${bits}`] = { kind: 'integer', min, max, unsigned: false };
  }
  // Int (arbitrary precision, signed)
  reg['Int'] = { kind: 'integer', min: null, max: null, unsigned: false };

  // -- Unsigned integers --
  for (const bits of signedSizes) {
    const { min, max } = intRange(bits, false);
    reg[`UInt${bits}`] = { kind: 'integer', min, max, unsigned: true };
  }
  // UInt (arbitrary precision, unsigned)
  reg['UInt'] = { kind: 'integer', min: 0n, max: null, unsigned: true };

  // -- Word types (unsigned, fixed-width) --
  const wordSizes = [8, 16, 32, 64, 128, 256];
  for (const bits of wordSizes) {
    const { min, max } = intRange(bits, false);
    reg[`Word${bits}`] = { kind: 'integer', min, max, unsigned: true };
  }

  // -- Fixed-point --
  reg['Fix64'] = {
    kind: 'fixed',
    decimals: 8,
    signed: true,
    min: '-92233720368.54775808',
    max: '92233720368.54775807',
  };
  reg['UFix64'] = {
    kind: 'fixed',
    decimals: 8,
    signed: false,
    min: '0.0',
    max: '184467440737.09551615',
  };

  // -- Basic types --
  reg['Bool'] = { kind: 'simple', validate: validateBool };
  reg['String'] = { kind: 'simple', validate: validateString };
  reg['Character'] = { kind: 'simple', validate: validateCharacter };
  reg['Address'] = { kind: 'simple', validate: validateAddress };

  // -- Composite wrappers --
  reg['Optional'] = { kind: 'composite', validate: validateOptional };
  reg['Array'] = { kind: 'composite', validate: validateArray };
  reg['Dictionary'] = { kind: 'composite', validate: validateDictionary };

  // -- Void (no value field needed) --
  reg['Void'] = {
    kind: 'simple',
    validate: (_value: unknown) => null,
  };

  return reg;
}

export const TYPE_REGISTRY: Record<string, TypeInfo> = buildRegistry();

/**
 * Check if a type name is recognized in V1.
 */
export function isKnownType(typeName: string): boolean {
  return typeName in TYPE_REGISTRY;
}
