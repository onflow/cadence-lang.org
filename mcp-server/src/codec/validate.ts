/**
 * JSON-CDC argument validation.
 *
 * Two modes:
 *   1. Standalone — validates JSON-CDC format, type names, and value correctness.
 *   2. With source code — additionally verifies arguments match the
 *      script/transaction entry function signature via LSP.
 */

import {
  TYPE_REGISTRY,
  isKnownType,
  type CadenceValue,
  type ValidationResult,
  type ArgResult,
  type ParameterInfo,
  type IntegerTypeInfo,
  type FixedPointTypeInfo,
} from './types.js';
import type { LSPManager } from '../lsp/client.js';
import type { FlowNetwork } from '../lsp/client.js';

// ---------------------------------------------------------------------------
// Single JSON-CDC value validation (recursive)
// ---------------------------------------------------------------------------

/**
 * Validate a single JSON-CDC value object.
 * Returns null if valid, or an error message string.
 */
export function validateValue(raw: unknown): string | null {
  if (raw === null || raw === undefined) {
    return 'value is null or undefined';
  }
  if (typeof raw !== 'object') {
    return `expected JSON-CDC object, got ${typeof raw}`;
  }

  const obj = raw as Record<string, unknown>;

  if (!('type' in obj) || typeof obj.type !== 'string') {
    return 'missing or non-string "type" field';
  }

  const typeName = obj.type;

  // Void has no value field
  if (typeName === 'Void') {
    return null;
  }

  if (!('value' in obj)) {
    return `missing "value" field for type ${typeName}`;
  }

  const value = obj.value;

  // Unknown type: warn but don't hard-fail (forward compatibility)
  if (!isKnownType(typeName)) {
    return null; // allow unknown types to pass through
  }

  const typeInfo = TYPE_REGISTRY[typeName];

  switch (typeInfo.kind) {
    case 'integer':
      return validateInteger(typeName, value, typeInfo);
    case 'fixed':
      return validateFixedPoint(typeName, value, typeInfo);
    case 'simple':
      return typeInfo.validate(value);
    case 'composite':
      return typeInfo.validate(value, validateValue);
  }
}

// ---------------------------------------------------------------------------
// Integer validation
// ---------------------------------------------------------------------------

function validateInteger(typeName: string, value: unknown, info: IntegerTypeInfo): string | null {
  if (typeof value !== 'string') {
    return `${typeName} value must be a string, got ${typeof value}`;
  }

  // Must be a valid decimal integer string (optional leading minus)
  if (!/^-?\d+$/.test(value)) {
    return `${typeName} value must be a decimal integer string, got '${value}'`;
  }

  const n = BigInt(value);

  if (info.unsigned && n < 0n) {
    return `${typeName} value must be non-negative, got ${value}`;
  }

  if (info.min !== null && n < info.min) {
    return `${typeName} value ${value} out of range [${info.min}, ${info.max}]`;
  }

  if (info.max !== null && n > info.max) {
    return `${typeName} value ${value} out of range [${info.min}, ${info.max}]`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Fixed-point validation
// ---------------------------------------------------------------------------

function validateFixedPoint(typeName: string, value: unknown, info: FixedPointTypeInfo): string | null {
  if (typeof value !== 'string') {
    return `${typeName} value must be a string, got ${typeof value}`;
  }

  // Must contain a decimal point
  if (!/^-?\d+\.\d+$/.test(value)) {
    return `${typeName} value must be a decimal string with integer and fractional parts (e.g. "1.0"), got '${value}'`;
  }

  const parts = value.split('.');
  const fractional = parts[1];

  if (fractional.length > info.decimals) {
    return `${typeName} allows max ${info.decimals} decimal places, got ${fractional.length}`;
  }

  if (!info.signed && value.startsWith('-')) {
    return `${typeName} must be non-negative, got '${value}'`;
  }

  // Range check: compare as scaled integers to avoid floating-point issues
  const scaledValue = parseFixedToScaled(value);
  const scaledMin = parseFixedToScaled(info.min);
  const scaledMax = parseFixedToScaled(info.max);

  if (scaledValue < scaledMin) {
    return `${typeName} value ${value} below minimum ${info.min}`;
  }
  if (scaledValue > scaledMax) {
    return `${typeName} value ${value} above maximum ${info.max}`;
  }

  return null;
}

/**
 * Parse a fixed-point decimal string into a scaled bigint (×10^8).
 */
function parseFixedToScaled(value: string): bigint {
  const negative = value.startsWith('-');
  const abs = negative ? value.slice(1) : value;
  const [intPart, fracPart = ''] = abs.split('.');
  const paddedFrac = fracPart.padEnd(8, '0').slice(0, 8);
  const combined = BigInt(intPart + paddedFrac);
  return negative ? -combined : combined;
}

// ---------------------------------------------------------------------------
// Standalone validation (no source code)
// ---------------------------------------------------------------------------

/**
 * Validate an array of JSON-CDC argument strings.
 */
export function validateArgs(argStrings: string[]): ValidationResult {
  const errors: string[] = [];
  const args: ArgResult[] = [];

  for (let i = 0; i < argStrings.length; i++) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(argStrings[i]);
    } catch (e: any) {
      const err = `invalid JSON: ${e.message}`;
      errors.push(`Arg ${i}: ${err}`);
      args.push({ index: i, type: 'unknown', value: argStrings[i], error: err });
      continue;
    }

    const err = validateValue(parsed);
    const cadVal = parsed as CadenceValue;
    const argResult: ArgResult = {
      index: i,
      type: cadVal?.type ?? 'unknown',
      value: cadVal?.value,
    };

    if (err) {
      argResult.error = err;
      errors.push(`Arg ${i}: ${err}`);
    }

    args.push(argResult);
  }

  return {
    valid: errors.length === 0,
    errors,
    args,
  };
}

// ---------------------------------------------------------------------------
// Signature extraction (regex fallback)
// ---------------------------------------------------------------------------

/**
 * Extract entry function parameters from Cadence source code using regex.
 *
 * Supports:
 *   - Scripts: `access(all) fun main(param1: Type1, param2: Type2)`
 *   - Transactions: `transaction(param1: Type1, param2: Type2)`
 *
 * This is a best-effort fallback when LSP is not available.
 */
export function extractParametersFromCode(code: string): ParameterInfo[] | null {
  // Try script entry: fun main(...)
  const scriptMatch = code.match(/fun\s+main\s*\(([^)]*)\)/);
  // Try transaction entry: transaction(...)
  const txMatch = code.match(/transaction\s*\(([^)]*)\)/);

  const paramsStr = scriptMatch?.[1] ?? txMatch?.[1];
  if (paramsStr === undefined) return null;

  // Empty params
  const trimmed = paramsStr.trim();
  if (trimmed === '') return [];

  const params: ParameterInfo[] = [];
  // Split by comma, but be careful with nested types like {String: UInt8}
  const paramParts = splitParams(trimmed);

  for (let i = 0; i < paramParts.length; i++) {
    const part = paramParts[i].trim();
    // Format: "name: Type" or "_ name: Type"
    const match = part.match(/^(?:_\s+)?(\w+)\s*:\s*(.+)$/);
    if (!match) continue;
    params.push({
      name: match[1],
      type: match[2].trim(),
      index: i,
    });
  }

  return params;
}

/**
 * Split parameter string by commas, respecting nested brackets and braces.
 */
function splitParams(str: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;

  for (const ch of str) {
    if (ch === '(' || ch === '[' || ch === '{' || ch === '<') {
      depth++;
    } else if (ch === ')' || ch === ']' || ch === '}' || ch === '>') {
      depth--;
    }
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

// ---------------------------------------------------------------------------
// Type compatibility check
// ---------------------------------------------------------------------------

/**
 * Check if a JSON-CDC type name is compatible with a Cadence parameter type.
 *
 * Handles basic mappings like:
 *   - "UInt8" matches "UInt8"
 *   - "Optional" matches "UInt8?" or "Optional<UInt8>"
 *   - "Array" matches "[UInt8]" or "Array<UInt8>"
 *   - "Dictionary" matches "{String: UInt8}"
 */
export function isTypeCompatible(jsonCdcType: string, cadenceType: string): boolean {
  const normalized = cadenceType.trim();

  // Direct match
  if (jsonCdcType === normalized) return true;

  // Optional: "Type?" or "Optional"
  if (jsonCdcType === 'Optional' && normalized.endsWith('?')) return true;

  // Array: "[Type]"
  if (jsonCdcType === 'Array' && normalized.startsWith('[') && normalized.endsWith(']')) return true;

  // Dictionary: "{Key: Value}"
  if (jsonCdcType === 'Dictionary' && normalized.startsWith('{') && normalized.endsWith('}')) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Validation with source code
// ---------------------------------------------------------------------------

/**
 * Validate JSON-CDC arguments against a Cadence script/transaction.
 *
 * 1. Runs standalone validation on all args.
 * 2. Extracts parameter signature from code (via LSP or regex fallback).
 * 3. Checks argument count and type compatibility.
 */
export async function validateArgsWithCode(
  argStrings: string[],
  code: string,
  lspManager?: LSPManager,
  network: FlowNetwork = 'mainnet',
): Promise<ValidationResult> {
  // Step 1: standalone validation
  const result = validateArgs(argStrings);

  // Step 2: extract parameters
  let params: ParameterInfo[] | null = null;

  if (lspManager) {
    try {
      params = await extractParametersViaLSP(code, lspManager, network);
    } catch {
      // Fall back to regex
      params = extractParametersFromCode(code);
    }
  } else {
    params = extractParametersFromCode(code);
  }

  if (params === null) {
    result.errors.push('Could not extract entry function parameters from code');
    result.valid = false;
    return result;
  }

  result.parameters = params;

  // Step 3: count check
  if (result.args.length !== params.length) {
    const paramDesc = params.map((p) => `${p.name}: ${p.type}`).join(', ');
    result.errors.push(
      `Expected ${params.length} argument(s) (${paramDesc}), got ${result.args.length}`,
    );
    result.valid = false;
  }

  // Step 4: type compatibility check
  const checkCount = Math.min(result.args.length, params.length);
  for (let i = 0; i < checkCount; i++) {
    const arg = result.args[i];
    const param = params[i];

    if (arg.error) continue; // already has standalone error

    if (!isTypeCompatible(arg.type, param.type)) {
      const err = `expected ${param.type}, got ${arg.type}`;
      arg.error = err;
      result.errors.push(`Arg ${i} (${param.name}): ${err}`);
      result.valid = false;
    }
  }

  // Mark extra args
  for (let i = params.length; i < result.args.length; i++) {
    const arg = result.args[i];
    if (!arg.error) {
      arg.error = 'unexpected extra argument';
      result.errors.push(`Arg ${i}: unexpected extra argument`);
      result.valid = false;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// LSP-based parameter extraction
// ---------------------------------------------------------------------------

/**
 * Extract entry function parameters via LSP hover.
 *
 * Strategy: find `fun main` or `transaction` keyword, hover over it
 * to get the function signature, then parse parameter types from the
 * hover result.
 */
async function extractParametersViaLSP(
  code: string,
  lspManager: LSPManager,
  network: FlowNetwork,
): Promise<ParameterInfo[] | null> {
  // Find the entry function position
  const lines = code.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    // Look for "fun main" in scripts
    const mainMatch = line.match(/\bfun\s+main\s*\(/);
    if (mainMatch && mainMatch.index !== undefined) {
      const charIdx = mainMatch.index + mainMatch[0].indexOf('main');
      const hover = await lspManager.hover(code, network, lineIdx, charIdx, 'validate.cdc');
      const params = parseParamsFromHover(hover);
      if (params) return params;
    }

    // Look for "transaction(" in transactions
    const txMatch = line.match(/\btransaction\s*\(/);
    if (txMatch && txMatch.index !== undefined) {
      const charIdx = txMatch.index;
      const hover = await lspManager.hover(code, network, lineIdx, charIdx, 'validate.cdc');
      const params = parseParamsFromHover(hover);
      if (params) return params;
    }
  }

  // Fall back to regex if LSP didn't yield results
  return extractParametersFromCode(code);
}

/**
 * Parse parameter info from an LSP hover result.
 *
 * Hover typically returns something like:
 *   `fun main(recipient: Address, amount: UFix64): Void`
 *
 * We extract the parameters from the parenthesized section.
 */
function parseParamsFromHover(hover: any): ParameterInfo[] | null {
  if (!hover?.contents) return null;

  let text = '';
  const contents = hover.contents;
  if (typeof contents === 'string') {
    text = contents;
  } else if (contents.value) {
    text = contents.value;
  } else if (Array.isArray(contents)) {
    text = contents.map((c: any) => (typeof c === 'string' ? c : c.value || '')).join('\n');
  }

  if (!text) return null;

  // Extract the parameter list from function signature
  const sigMatch = text.match(/\(([^)]*)\)/);
  if (!sigMatch) return null;

  const paramsStr = sigMatch[1].trim();
  if (paramsStr === '') return [];

  return extractParametersFromCode(`fun main(${paramsStr})`);
}
