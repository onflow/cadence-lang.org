#!/usr/bin/env node
/**
 * Generate error test fixtures by testing what @onflow/types accepts/rejects.
 *
 * Run: node src/codec/fixtures/generate-errors.mjs
 *
 * For each test case, tries to encode with FCL and records whether it
 * succeeds or throws. Our validator must agree on every case.
 */

import * as t from '@onflow/types';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function tryEncode(value, type) {
  try {
    const result = type.asArgument(value);
    return { accepted: true, result };
  } catch (e) {
    return { accepted: false, error: e.message };
  }
}

const cases = [];

function addCase(name, typeName, fclType, value) {
  const outcome = tryEncode(value, fclType);
  cases.push({ name, typeName, value, ...outcome });
}

// ---------------------------------------------------------------------------
// UInt8 boundaries
// ---------------------------------------------------------------------------
addCase('UInt8/0', 'UInt8', t.UInt8, '0');
addCase('UInt8/255', 'UInt8', t.UInt8, '255');
addCase('UInt8/256', 'UInt8', t.UInt8, '256');
addCase('UInt8/-1', 'UInt8', t.UInt8, '-1');
addCase('UInt8/abc', 'UInt8', t.UInt8, 'abc');
addCase('UInt8/empty', 'UInt8', t.UInt8, '');
addCase('UInt8/number', 'UInt8', t.UInt8, 123);

// Int8 boundaries
addCase('Int8/-128', 'Int8', t.Int8, '-128');
addCase('Int8/127', 'Int8', t.Int8, '127');
addCase('Int8/128', 'Int8', t.Int8, '128');
addCase('Int8/-129', 'Int8', t.Int8, '-129');

// UInt16
addCase('UInt16/65535', 'UInt16', t.UInt16, '65535');
addCase('UInt16/65536', 'UInt16', t.UInt16, '65536');

// UInt32
addCase('UInt32/4294967295', 'UInt32', t.UInt32, '4294967295');
addCase('UInt32/4294967296', 'UInt32', t.UInt32, '4294967296');

// UInt64
addCase('UInt64/max', 'UInt64', t.UInt64, '18446744073709551615');
addCase('UInt64/overflow', 'UInt64', t.UInt64, '18446744073709551616');

// Int16
addCase('Int16/-32768', 'Int16', t.Int16, '-32768');
addCase('Int16/32767', 'Int16', t.Int16, '32767');
addCase('Int16/-32769', 'Int16', t.Int16, '-32769');
addCase('Int16/32768', 'Int16', t.Int16, '32768');

// Int32
addCase('Int32/min', 'Int32', t.Int32, '-2147483648');
addCase('Int32/max', 'Int32', t.Int32, '2147483647');
addCase('Int32/underflow', 'Int32', t.Int32, '-2147483649');
addCase('Int32/overflow', 'Int32', t.Int32, '2147483648');

// Int64
addCase('Int64/min', 'Int64', t.Int64, '-9223372036854775808');
addCase('Int64/max', 'Int64', t.Int64, '9223372036854775807');
addCase('Int64/underflow', 'Int64', t.Int64, '-9223372036854775809');
addCase('Int64/overflow', 'Int64', t.Int64, '9223372036854775808');

// Int (arbitrary precision)
addCase('Int/huge_positive', 'Int', t.Int, '99999999999999999999999999999');
addCase('Int/huge_negative', 'Int', t.Int, '-99999999999999999999999999999');

// UInt (arbitrary precision, unsigned)
addCase('UInt/huge', 'UInt', t.UInt, '99999999999999999999999999999');
addCase('UInt/-1', 'UInt', t.UInt, '-1');

// Word8
addCase('Word8/255', 'Word8', t.Word8, '255');
addCase('Word8/256', 'Word8', t.Word8, '256');

// Word16
addCase('Word16/65535', 'Word16', t.Word16, '65535');
addCase('Word16/65536', 'Word16', t.Word16, '65536');

// Word32
addCase('Word32/max', 'Word32', t.Word32, '4294967295');
addCase('Word32/overflow', 'Word32', t.Word32, '4294967296');

// Word64
addCase('Word64/max', 'Word64', t.Word64, '18446744073709551615');
addCase('Word64/overflow', 'Word64', t.Word64, '18446744073709551616');

// ---------------------------------------------------------------------------
// Fix64 / UFix64
// ---------------------------------------------------------------------------
addCase('UFix64/0.0', 'UFix64', t.UFix64, '0.0');
addCase('UFix64/10.5', 'UFix64', t.UFix64, '10.5');
addCase('UFix64/10.12345678', 'UFix64', t.UFix64, '10.12345678');
addCase('UFix64/-1.0', 'UFix64', t.UFix64, '-1.0');
addCase('UFix64/no_decimal', 'UFix64', t.UFix64, '10');
addCase('UFix64/too_many_decimals', 'UFix64', t.UFix64, '1.123456789');

addCase('Fix64/0.0', 'Fix64', t.Fix64, '0.0');
addCase('Fix64/12.3', 'Fix64', t.Fix64, '12.3');
addCase('Fix64/-12.3', 'Fix64', t.Fix64, '-12.3');
addCase('Fix64/too_many_decimals', 'Fix64', t.Fix64, '1.123456789');

// ---------------------------------------------------------------------------
// Bool
// ---------------------------------------------------------------------------
addCase('Bool/true', 'Bool', t.Bool, true);
addCase('Bool/false', 'Bool', t.Bool, false);
addCase('Bool/string_true', 'Bool', t.Bool, 'true');
addCase('Bool/number', 'Bool', t.Bool, 1);

// ---------------------------------------------------------------------------
// String
// ---------------------------------------------------------------------------
addCase('String/hello', 'String', t.String, 'Hello');
addCase('String/empty', 'String', t.String, '');
addCase('String/unicode', 'String', t.String, '你好🌍');
addCase('String/number', 'String', t.String, 123);

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------
addCase('Address/valid', 'Address', t.Address, '0x1654653399040a61');
addCase('Address/short', 'Address', t.Address, '0x1');
addCase('Address/no_prefix', 'Address', t.Address, '1654653399040a61');
addCase('Address/invalid_hex', 'Address', t.Address, '0xGGGG');

// ---------------------------------------------------------------------------
// Optional
// ---------------------------------------------------------------------------
addCase('Optional/null', 'Optional', t.Optional(t.String), null);
addCase('Optional/some', 'Optional', t.Optional(t.UInt8), '42');

// ---------------------------------------------------------------------------
// Array
// ---------------------------------------------------------------------------
addCase('Array/empty', 'Array', t.Array(t.String), []);
addCase('Array/strings', 'Array', t.Array(t.String), ['a', 'b']);
addCase('Array/uint8s', 'Array', t.Array(t.UInt8), ['1', '2', '3']);

// ---------------------------------------------------------------------------
// Dictionary
// ---------------------------------------------------------------------------
addCase('Dict/empty', 'Dictionary', t.Dictionary({ key: t.String, value: t.UInt8 }), []);
addCase('Dict/basic', 'Dictionary', t.Dictionary({ key: t.String, value: t.UInt8 }), [
  { key: 'a', value: '1' },
]);

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const outPath = join(__dirname, 'error-cases.json');
writeFileSync(outPath, JSON.stringify(cases, null, 2) + '\n');

const accepted = cases.filter((c) => c.accepted).length;
const rejected = cases.filter((c) => !c.accepted).length;
console.log(`Generated ${cases.length} cases (${accepted} accepted, ${rejected} rejected) → ${outPath}`);
