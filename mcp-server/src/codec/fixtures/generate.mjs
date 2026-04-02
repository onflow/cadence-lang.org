#!/usr/bin/env node
/**
 * Generate JSON-CDC test fixtures using @onflow/types as ground truth.
 *
 * Run: node src/codec/fixtures/generate.mjs
 *
 * Requires: npm install @onflow/types (devDependency)
 *
 * Outputs expected.json with valid JSON-CDC for every V1 type.
 */

import * as t from '@onflow/types';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Encode a single argument using @onflow/types.
 * Returns the JSON-CDC object.
 */
function encode(value, type) {
  // @onflow/types exposes an asArgument method on each type
  return type.asArgument(value);
}

const fixtures = {};

// ---------------------------------------------------------------------------
// Integer types
// ---------------------------------------------------------------------------

// Int (arbitrary precision)
fixtures['Int/zero'] = { input: { type: 'Int', value: '0' }, expected: encode('0', t.Int) };
fixtures['Int/positive'] = { input: { type: 'Int', value: '42' }, expected: encode('42', t.Int) };
fixtures['Int/negative'] = { input: { type: 'Int', value: '-42' }, expected: encode('-42', t.Int) };
fixtures['Int/large'] = { input: { type: 'Int', value: '999999999999999999999' }, expected: encode('999999999999999999999', t.Int) };

// UInt (arbitrary precision, unsigned)
fixtures['UInt/zero'] = { input: { type: 'UInt', value: '0' }, expected: encode('0', t.UInt) };
fixtures['UInt/positive'] = { input: { type: 'UInt', value: '42' }, expected: encode('42', t.UInt) };
fixtures['UInt/large'] = { input: { type: 'UInt', value: '999999999999999999999' }, expected: encode('999999999999999999999', t.UInt) };

// Int8
fixtures['Int8/zero'] = { input: { type: 'Int8', value: '0' }, expected: encode('0', t.Int8) };
fixtures['Int8/min'] = { input: { type: 'Int8', value: '-128' }, expected: encode('-128', t.Int8) };
fixtures['Int8/max'] = { input: { type: 'Int8', value: '127' }, expected: encode('127', t.Int8) };

// UInt8
fixtures['UInt8/zero'] = { input: { type: 'UInt8', value: '0' }, expected: encode('0', t.UInt8) };
fixtures['UInt8/max'] = { input: { type: 'UInt8', value: '255' }, expected: encode('255', t.UInt8) };
fixtures['UInt8/mid'] = { input: { type: 'UInt8', value: '123' }, expected: encode('123', t.UInt8) };

// Int16
fixtures['Int16/min'] = { input: { type: 'Int16', value: '-32768' }, expected: encode('-32768', t.Int16) };
fixtures['Int16/max'] = { input: { type: 'Int16', value: '32767' }, expected: encode('32767', t.Int16) };

// UInt16
fixtures['UInt16/zero'] = { input: { type: 'UInt16', value: '0' }, expected: encode('0', t.UInt16) };
fixtures['UInt16/max'] = { input: { type: 'UInt16', value: '65535' }, expected: encode('65535', t.UInt16) };

// Int32
fixtures['Int32/min'] = { input: { type: 'Int32', value: '-2147483648' }, expected: encode('-2147483648', t.Int32) };
fixtures['Int32/max'] = { input: { type: 'Int32', value: '2147483647' }, expected: encode('2147483647', t.Int32) };

// UInt32
fixtures['UInt32/max'] = { input: { type: 'UInt32', value: '4294967295' }, expected: encode('4294967295', t.UInt32) };

// Int64
fixtures['Int64/min'] = { input: { type: 'Int64', value: '-9223372036854775808' }, expected: encode('-9223372036854775808', t.Int64) };
fixtures['Int64/max'] = { input: { type: 'Int64', value: '9223372036854775807' }, expected: encode('9223372036854775807', t.Int64) };

// UInt64
fixtures['UInt64/max'] = { input: { type: 'UInt64', value: '18446744073709551615' }, expected: encode('18446744073709551615', t.UInt64) };

// Int128
fixtures['Int128/zero'] = { input: { type: 'Int128', value: '0' }, expected: encode('0', t.Int128) };
fixtures['Int128/positive'] = { input: { type: 'Int128', value: '170141183460469231731687303715884105727' }, expected: encode('170141183460469231731687303715884105727', t.Int128) };

// UInt128
fixtures['UInt128/max'] = { input: { type: 'UInt128', value: '340282366920938463463374607431768211455' }, expected: encode('340282366920938463463374607431768211455', t.UInt128) };

// Int256
fixtures['Int256/zero'] = { input: { type: 'Int256', value: '0' }, expected: encode('0', t.Int256) };

// UInt256
fixtures['UInt256/zero'] = { input: { type: 'UInt256', value: '0' }, expected: encode('0', t.UInt256) };

// Word8
fixtures['Word8/zero'] = { input: { type: 'Word8', value: '0' }, expected: encode('0', t.Word8) };
fixtures['Word8/max'] = { input: { type: 'Word8', value: '255' }, expected: encode('255', t.Word8) };

// Word16
fixtures['Word16/max'] = { input: { type: 'Word16', value: '65535' }, expected: encode('65535', t.Word16) };

// Word32
fixtures['Word32/max'] = { input: { type: 'Word32', value: '4294967295' }, expected: encode('4294967295', t.Word32) };

// Word64
fixtures['Word64/max'] = { input: { type: 'Word64', value: '18446744073709551615' }, expected: encode('18446744073709551615', t.Word64) };

// ---------------------------------------------------------------------------
// Fixed-point
// ---------------------------------------------------------------------------

// UFix64
fixtures['UFix64/zero'] = { input: { type: 'UFix64', value: '0.0' }, expected: encode('0.0', t.UFix64) };
fixtures['UFix64/integer'] = { input: { type: 'UFix64', value: '10.0' }, expected: encode('10.0', t.UFix64) };
fixtures['UFix64/decimal'] = { input: { type: 'UFix64', value: '10.5' }, expected: encode('10.5', t.UFix64) };
fixtures['UFix64/precision'] = { input: { type: 'UFix64', value: '10.12345678' }, expected: encode('10.12345678', t.UFix64) };

// Fix64
fixtures['Fix64/zero'] = { input: { type: 'Fix64', value: '0.0' }, expected: encode('0.0', t.Fix64) };
fixtures['Fix64/positive'] = { input: { type: 'Fix64', value: '12.3' }, expected: encode('12.3', t.Fix64) };
fixtures['Fix64/negative'] = { input: { type: 'Fix64', value: '-12.3' }, expected: encode('-12.3', t.Fix64) };

// ---------------------------------------------------------------------------
// Basic types
// ---------------------------------------------------------------------------

// Bool
fixtures['Bool/true'] = { input: { type: 'Bool', value: true }, expected: encode(true, t.Bool) };
fixtures['Bool/false'] = { input: { type: 'Bool', value: false }, expected: encode(false, t.Bool) };

// String
fixtures['String/empty'] = { input: { type: 'String', value: '' }, expected: encode('', t.String) };
fixtures['String/hello'] = { input: { type: 'String', value: 'Hello, world!' }, expected: encode('Hello, world!', t.String) };
fixtures['String/unicode'] = { input: { type: 'String', value: '你好🌍' }, expected: encode('你好🌍', t.String) };

// Character
fixtures['Character/single'] = { input: { type: 'Character', value: 'a' }, expected: encode('a', t.Character) };
fixtures['Character/unicode'] = { input: { type: 'Character', value: '🌍' }, expected: encode('🌍', t.Character) };

// Address
fixtures['Address/standard'] = { input: { type: 'Address', value: '0x1654653399040a61' }, expected: encode('0x1654653399040a61', t.Address) };
fixtures['Address/short'] = { input: { type: 'Address', value: '0x1' }, expected: encode('0x1', t.Address) };

// ---------------------------------------------------------------------------
// Composite wrappers
// ---------------------------------------------------------------------------

// Optional
fixtures['Optional/null'] = { input: { type: 'Optional', value: null }, expected: encode(null, t.Optional(t.String)) };
fixtures['Optional/some_uint8'] = {
  input: { type: 'Optional', value: { type: 'UInt8', value: '123' } },
  expected: encode('123', t.Optional(t.UInt8)),
};

// Array
fixtures['Array/empty'] = {
  input: { type: 'Array', value: [] },
  expected: encode([], t.Array(t.String)),
};
fixtures['Array/strings'] = {
  input: {
    type: 'Array',
    value: [
      { type: 'String', value: 'hello' },
      { type: 'String', value: 'world' },
    ],
  },
  expected: encode(['hello', 'world'], t.Array(t.String)),
};
fixtures['Array/uint8s'] = {
  input: {
    type: 'Array',
    value: [
      { type: 'UInt8', value: '1' },
      { type: 'UInt8', value: '2' },
      { type: 'UInt8', value: '3' },
    ],
  },
  expected: encode(['1', '2', '3'], t.Array(t.UInt8)),
};

// Dictionary
fixtures['Dictionary/empty'] = {
  input: { type: 'Dictionary', value: [] },
  expected: encode([], t.Dictionary({ key: t.String, value: t.UInt8 })),
};
fixtures['Dictionary/string_uint8'] = {
  input: {
    type: 'Dictionary',
    value: [
      {
        key: { type: 'String', value: 'a' },
        value: { type: 'UInt8', value: '1' },
      },
    ],
  },
  expected: encode(
    [{ key: 'a', value: '1' }],
    t.Dictionary({ key: t.String, value: t.UInt8 }),
  ),
};

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

const outPath = join(__dirname, 'expected.json');
writeFileSync(outPath, JSON.stringify(fixtures, null, 2) + '\n');
console.log(`Generated ${Object.keys(fixtures).length} fixtures → ${outPath}`);
