import { describe, it, expect } from 'bun:test';
import {
  validateValue,
  validateArgs,
  extractParametersFromCode,
  isTypeCompatible,
  validateArgsWithCode,
} from './validate';
import expected from './fixtures/expected.json';
import errorCases from './fixtures/error-cases.json';

// ---------------------------------------------------------------------------
// FCL parity — all valid fixtures must pass our validator
// ---------------------------------------------------------------------------

describe('FCL parity — valid JSON-CDC (FCL output)', () => {
  for (const [name, fixture] of Object.entries(expected)) {
    it(name, () => {
      const result = validateValue((fixture as any).expected);
      expect(result).toBeNull();
    });
  }
});

describe('FCL parity — valid JSON-CDC (FCL input)', () => {
  for (const [name, fixture] of Object.entries(expected)) {
    it(name, () => {
      const result = validateValue((fixture as any).input);
      expect(result).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// FCL parity — cases FCL rejects, we must also reject
// ---------------------------------------------------------------------------

describe('FCL parity — FCL-rejected cases also fail our validator', () => {
  const rejected = (errorCases as any[]).filter((c) => !c.accepted);
  for (const c of rejected) {
    it(c.name, () => {
      const err = validateValue({ type: c.typeName, value: c.value });
      expect(err).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// Stricter than FCL — we reject values FCL blindly accepts
//
// FCL's @onflow/types does minimal validation (no range checks, no address
// format checks). We intentionally catch these errors early so AI agents
// don't have to wait for on-chain execution to discover bad arguments.
// ---------------------------------------------------------------------------

describe('Stricter than FCL — we catch errors FCL misses', () => {
  // FCL accepts these, but they are invalid Cadence values
  it('UInt8 overflow (256)', () => {
    expect(validateValue({ type: 'UInt8', value: '256' })).not.toBeNull();
  });

  it('UInt8 negative (-1)', () => {
    expect(validateValue({ type: 'UInt8', value: '-1' })).not.toBeNull();
  });

  it('UInt8 non-numeric string', () => {
    expect(validateValue({ type: 'UInt8', value: 'abc' })).not.toBeNull();
  });

  it('UInt8 empty string', () => {
    expect(validateValue({ type: 'UInt8', value: '' })).not.toBeNull();
  });

  it('Int8 overflow (128)', () => {
    expect(validateValue({ type: 'Int8', value: '128' })).not.toBeNull();
  });

  it('Int8 underflow (-129)', () => {
    expect(validateValue({ type: 'Int8', value: '-129' })).not.toBeNull();
  });

  it('UInt16 overflow', () => {
    expect(validateValue({ type: 'UInt16', value: '65536' })).not.toBeNull();
  });

  it('UInt32 overflow', () => {
    expect(validateValue({ type: 'UInt32', value: '4294967296' })).not.toBeNull();
  });

  it('UInt64 overflow', () => {
    expect(validateValue({ type: 'UInt64', value: '18446744073709551616' })).not.toBeNull();
  });

  it('Int16 overflow/underflow', () => {
    expect(validateValue({ type: 'Int16', value: '32768' })).not.toBeNull();
    expect(validateValue({ type: 'Int16', value: '-32769' })).not.toBeNull();
  });

  it('Int32 overflow/underflow', () => {
    expect(validateValue({ type: 'Int32', value: '2147483648' })).not.toBeNull();
    expect(validateValue({ type: 'Int32', value: '-2147483649' })).not.toBeNull();
  });

  it('Int64 overflow/underflow', () => {
    expect(validateValue({ type: 'Int64', value: '9223372036854775808' })).not.toBeNull();
    expect(validateValue({ type: 'Int64', value: '-9223372036854775809' })).not.toBeNull();
  });

  it('UInt negative (-1)', () => {
    expect(validateValue({ type: 'UInt', value: '-1' })).not.toBeNull();
  });

  it('Word8 overflow (256)', () => {
    expect(validateValue({ type: 'Word8', value: '256' })).not.toBeNull();
  });

  it('Word16 overflow', () => {
    expect(validateValue({ type: 'Word16', value: '65536' })).not.toBeNull();
  });

  it('Word32 overflow', () => {
    expect(validateValue({ type: 'Word32', value: '4294967296' })).not.toBeNull();
  });

  it('Word64 overflow', () => {
    expect(validateValue({ type: 'Word64', value: '18446744073709551616' })).not.toBeNull();
  });

  it('UFix64 negative', () => {
    expect(validateValue({ type: 'UFix64', value: '-1.0' })).not.toBeNull();
  });

  it('Address without 0x prefix', () => {
    expect(validateValue({ type: 'Address', value: '1654653399040a61' })).not.toBeNull();
  });

  it('Address with invalid hex', () => {
    expect(validateValue({ type: 'Address', value: '0xGGGG' })).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validateArgs — standalone mode
// ---------------------------------------------------------------------------

describe('validateArgs — valid args', () => {
  it('empty args list', () => {
    const result = validateArgs([]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.args).toHaveLength(0);
  });

  it('single UInt8', () => {
    const result = validateArgs(['{"type":"UInt8","value":"123"}']);
    expect(result.valid).toBe(true);
    expect(result.args[0].type).toBe('UInt8');
  });

  it('multiple args', () => {
    const result = validateArgs([
      '{"type":"Address","value":"0x1654653399040a61"}',
      '{"type":"UFix64","value":"10.50000000"}',
      '{"type":"String","value":"hello"}',
    ]);
    expect(result.valid).toBe(true);
    expect(result.args).toHaveLength(3);
  });

  it('nested array of UInt8', () => {
    const result = validateArgs([
      '{"type":"Array","value":[{"type":"UInt8","value":"1"},{"type":"UInt8","value":"2"}]}',
    ]);
    expect(result.valid).toBe(true);
  });

  it('dictionary', () => {
    const result = validateArgs([
      '{"type":"Dictionary","value":[{"key":{"type":"String","value":"a"},"value":{"type":"UInt8","value":"1"}}]}',
    ]);
    expect(result.valid).toBe(true);
  });

  it('optional null', () => {
    const result = validateArgs(['{"type":"Optional","value":null}']);
    expect(result.valid).toBe(true);
  });

  it('optional some', () => {
    const result = validateArgs([
      '{"type":"Optional","value":{"type":"UInt8","value":"42"}}',
    ]);
    expect(result.valid).toBe(true);
  });

  it('Void', () => {
    const result = validateArgs(['{"type":"Void"}']);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateArgs — invalid JSON
// ---------------------------------------------------------------------------

describe('validateArgs — invalid JSON', () => {
  it('malformed JSON', () => {
    const result = validateArgs(['not json']);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Arg 0');
    expect(result.errors[0]).toContain('invalid JSON');
  });

  it('empty string', () => {
    const result = validateArgs(['']);
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateArgs — structural errors
// ---------------------------------------------------------------------------

describe('validateArgs — structural errors', () => {
  it('missing type field', () => {
    const result = validateArgs(['{"value":"123"}']);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('missing or non-string "type"');
  });

  it('missing value field', () => {
    const result = validateArgs(['{"type":"UInt8"}']);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('missing "value"');
  });

  it('non-string type field', () => {
    const result = validateArgs(['{"type":123,"value":"0"}']);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('missing or non-string "type"');
  });
});

// ---------------------------------------------------------------------------
// Integer validation errors
// ---------------------------------------------------------------------------

describe('validateValue — integer errors', () => {
  it('UInt8 overflow', () => {
    const err = validateValue({ type: 'UInt8', value: '256' });
    expect(err).toContain('out of range');
    expect(err).toContain('255');
  });

  it('UInt8 negative', () => {
    const err = validateValue({ type: 'UInt8', value: '-1' });
    expect(err).toContain('non-negative');
  });

  it('Int8 overflow', () => {
    const err = validateValue({ type: 'Int8', value: '128' });
    expect(err).toContain('out of range');
  });

  it('Int8 underflow', () => {
    const err = validateValue({ type: 'Int8', value: '-129' });
    expect(err).toContain('out of range');
  });

  it('integer value not a string', () => {
    const err = validateValue({ type: 'UInt8', value: 123 });
    expect(err).toContain('must be a string');
  });

  it('integer value not a number', () => {
    const err = validateValue({ type: 'UInt8', value: 'abc' });
    expect(err).toContain('decimal integer string');
  });

  it('UInt negative', () => {
    const err = validateValue({ type: 'UInt', value: '-1' });
    expect(err).toContain('non-negative');
  });

  it('Int allows any value', () => {
    expect(validateValue({ type: 'Int', value: '-99999999999999999999' })).toBeNull();
    expect(validateValue({ type: 'Int', value: '99999999999999999999' })).toBeNull();
  });

  it('Word8 max', () => {
    expect(validateValue({ type: 'Word8', value: '255' })).toBeNull();
  });

  it('Word8 overflow', () => {
    const err = validateValue({ type: 'Word8', value: '256' });
    expect(err).toContain('out of range');
  });

  it('UInt16 max boundary', () => {
    expect(validateValue({ type: 'UInt16', value: '65535' })).toBeNull();
    expect(validateValue({ type: 'UInt16', value: '65536' })).toContain('out of range');
  });

  it('UInt32 max boundary', () => {
    expect(validateValue({ type: 'UInt32', value: '4294967295' })).toBeNull();
    expect(validateValue({ type: 'UInt32', value: '4294967296' })).toContain('out of range');
  });

  it('UInt64 max boundary', () => {
    expect(validateValue({ type: 'UInt64', value: '18446744073709551615' })).toBeNull();
    expect(validateValue({ type: 'UInt64', value: '18446744073709551616' })).toContain('out of range');
  });

  it('Int16 boundaries', () => {
    expect(validateValue({ type: 'Int16', value: '-32768' })).toBeNull();
    expect(validateValue({ type: 'Int16', value: '32767' })).toBeNull();
    expect(validateValue({ type: 'Int16', value: '-32769' })).toContain('out of range');
    expect(validateValue({ type: 'Int16', value: '32768' })).toContain('out of range');
  });

  it('Int32 boundaries', () => {
    expect(validateValue({ type: 'Int32', value: '-2147483648' })).toBeNull();
    expect(validateValue({ type: 'Int32', value: '2147483647' })).toBeNull();
    expect(validateValue({ type: 'Int32', value: '-2147483649' })).toContain('out of range');
    expect(validateValue({ type: 'Int32', value: '2147483648' })).toContain('out of range');
  });

  it('Int64 boundaries', () => {
    expect(validateValue({ type: 'Int64', value: '-9223372036854775808' })).toBeNull();
    expect(validateValue({ type: 'Int64', value: '9223372036854775807' })).toBeNull();
    expect(validateValue({ type: 'Int64', value: '-9223372036854775809' })).toContain('out of range');
    expect(validateValue({ type: 'Int64', value: '9223372036854775808' })).toContain('out of range');
  });

  it('Word16 boundary', () => {
    expect(validateValue({ type: 'Word16', value: '65535' })).toBeNull();
    expect(validateValue({ type: 'Word16', value: '65536' })).toContain('out of range');
  });

  it('Word32 boundary', () => {
    expect(validateValue({ type: 'Word32', value: '4294967295' })).toBeNull();
    expect(validateValue({ type: 'Word32', value: '4294967296' })).toContain('out of range');
  });

  it('Word64 boundary', () => {
    expect(validateValue({ type: 'Word64', value: '18446744073709551615' })).toBeNull();
    expect(validateValue({ type: 'Word64', value: '18446744073709551616' })).toContain('out of range');
  });
});

// ---------------------------------------------------------------------------
// Fixed-point validation errors
// ---------------------------------------------------------------------------

describe('validateValue — fixed-point errors', () => {
  it('UFix64 negative', () => {
    const err = validateValue({ type: 'UFix64', value: '-1.0' });
    expect(err).toContain('non-negative');
  });

  it('UFix64 too many decimals', () => {
    const err = validateValue({ type: 'UFix64', value: '1.123456789' });
    expect(err).toContain('decimal places');
  });

  it('UFix64 no decimal point', () => {
    const err = validateValue({ type: 'UFix64', value: '10' });
    expect(err).toContain('decimal string');
  });

  it('UFix64 value not a string', () => {
    const err = validateValue({ type: 'UFix64', value: 10.5 });
    expect(err).toContain('must be a string');
  });

  it('Fix64 too many decimals', () => {
    const err = validateValue({ type: 'Fix64', value: '1.123456789' });
    expect(err).toContain('decimal places');
  });

  it('UFix64 valid with 8 decimal places', () => {
    expect(validateValue({ type: 'UFix64', value: '10.12345678' })).toBeNull();
  });

  it('UFix64 valid padded', () => {
    expect(validateValue({ type: 'UFix64', value: '10.50000000' })).toBeNull();
  });

  it('Fix64 valid negative', () => {
    expect(validateValue({ type: 'Fix64', value: '-12.30000000' })).toBeNull();
  });

  it('UFix64 above maximum', () => {
    const err = validateValue({ type: 'UFix64', value: '184467440738.0' });
    expect(err).toContain('above maximum');
  });

  it('Fix64 below minimum', () => {
    const err = validateValue({ type: 'Fix64', value: '-92233720369.0' });
    expect(err).toContain('below minimum');
  });

  it('Fix64 above maximum', () => {
    const err = validateValue({ type: 'Fix64', value: '92233720369.0' });
    expect(err).toContain('above maximum');
  });
});

// ---------------------------------------------------------------------------
// Basic type validation errors
// ---------------------------------------------------------------------------

describe('validateValue — basic type errors', () => {
  it('Bool wrong type', () => {
    const err = validateValue({ type: 'Bool', value: 'true' });
    expect(err).toContain('expected boolean');
  });

  it('String wrong type', () => {
    const err = validateValue({ type: 'String', value: 123 });
    expect(err).toContain('expected string');
  });

  it('Character empty', () => {
    const err = validateValue({ type: 'Character', value: '' });
    expect(err).toContain('non-empty');
  });

  it('Address no prefix', () => {
    const err = validateValue({ type: 'Address', value: '1654653399040a61' });
    expect(err).toContain('0x-prefixed');
  });

  it('Address invalid hex', () => {
    const err = validateValue({ type: 'Address', value: '0xGGGG' });
    expect(err).toContain('invalid Address');
  });

  it('Address too long', () => {
    const err = validateValue({ type: 'Address', value: '0x12345678901234567' });
    expect(err).toContain('invalid Address');
  });
});

// ---------------------------------------------------------------------------
// Composite type validation errors
// ---------------------------------------------------------------------------

describe('validateValue — composite errors', () => {
  it('Array not an array', () => {
    const err = validateValue({ type: 'Array', value: 'not array' });
    expect(err).toContain('expected array');
  });

  it('Array with invalid element', () => {
    const err = validateValue({
      type: 'Array',
      value: [{ type: 'UInt8', value: '256' }],
    });
    expect(err).toContain('element [0]');
    expect(err).toContain('out of range');
  });

  it('Dictionary not an array', () => {
    const err = validateValue({ type: 'Dictionary', value: {} });
    expect(err).toContain('expected array');
  });

  it('Dictionary entry missing key', () => {
    const err = validateValue({
      type: 'Dictionary',
      value: [{ value: { type: 'String', value: 'x' } }],
    });
    expect(err).toContain('entry [0]');
    expect(err).toContain('{key, value}');
  });

  it('Dictionary with invalid key value', () => {
    const err = validateValue({
      type: 'Dictionary',
      value: [
        {
          key: { type: 'UInt8', value: '256' },
          value: { type: 'String', value: 'x' },
        },
      ],
    });
    expect(err).toContain('entry [0] key');
    expect(err).toContain('out of range');
  });

  it('Dictionary with invalid value', () => {
    const err = validateValue({
      type: 'Dictionary',
      value: [
        {
          key: { type: 'String', value: 'a' },
          value: { type: 'UInt8', value: '300' },
        },
      ],
    });
    expect(err).toContain('entry [0] value');
    expect(err).toContain('out of range');
  });

  it('Optional with invalid inner value', () => {
    const err = validateValue({
      type: 'Optional',
      value: { type: 'UInt8', value: '300' },
    });
    expect(err).toContain('out of range');
  });

  it('nested Array of Optional', () => {
    expect(
      validateValue({
        type: 'Array',
        value: [
          { type: 'Optional', value: null },
          { type: 'Optional', value: { type: 'UInt8', value: '42' } },
        ],
      }),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Unknown types — forward compatibility
// ---------------------------------------------------------------------------

describe('validateValue — unknown types', () => {
  it('unknown type passes (forward compat)', () => {
    expect(validateValue({ type: 'Struct', value: { id: 'test', fields: [] } })).toBeNull();
  });

  it('unknown type with any value', () => {
    expect(validateValue({ type: 'Resource', value: 'anything' })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractParametersFromCode
// ---------------------------------------------------------------------------

describe('extractParametersFromCode', () => {
  it('script with no params', () => {
    const params = extractParametersFromCode('access(all) fun main() { }');
    expect(params).toEqual([]);
  });

  it('script with simple params', () => {
    const params = extractParametersFromCode(
      'access(all) fun main(recipient: Address, amount: UFix64): Void { }',
    );
    expect(params).toEqual([
      { name: 'recipient', type: 'Address', index: 0 },
      { name: 'amount', type: 'UFix64', index: 1 },
    ]);
  });

  it('transaction with params', () => {
    const params = extractParametersFromCode(
      'transaction(amount: UFix64, to: Address) { prepare(signer: &Account) { } }',
    );
    expect(params).toEqual([
      { name: 'amount', type: 'UFix64', index: 0 },
      { name: 'to', type: 'Address', index: 1 },
    ]);
  });

  it('script with Optional param', () => {
    const params = extractParametersFromCode('access(all) fun main(name: String?)');
    expect(params).toEqual([{ name: 'name', type: 'String?', index: 0 }]);
  });

  it('script with Array param', () => {
    const params = extractParametersFromCode('access(all) fun main(ids: [UInt64])');
    expect(params).toEqual([{ name: 'ids', type: '[UInt64]', index: 0 }]);
  });

  it('script with Dict param', () => {
    const params = extractParametersFromCode('access(all) fun main(data: {String: UInt64})');
    expect(params).toEqual([{ name: 'data', type: '{String: UInt64}', index: 0 }]);
  });

  it('no entry function', () => {
    const params = extractParametersFromCode('access(all) contract Foo { }');
    expect(params).toBeNull();
  });

  it('transaction with no params', () => {
    const params = extractParametersFromCode('transaction() { prepare(signer: &Account) {} }');
    expect(params).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// isTypeCompatible
// ---------------------------------------------------------------------------

describe('isTypeCompatible', () => {
  it('direct match', () => {
    expect(isTypeCompatible('UInt8', 'UInt8')).toBe(true);
    expect(isTypeCompatible('Address', 'Address')).toBe(true);
  });

  it('no match', () => {
    expect(isTypeCompatible('UInt8', 'String')).toBe(false);
  });

  it('Optional with ?', () => {
    expect(isTypeCompatible('Optional', 'UInt8?')).toBe(true);
    expect(isTypeCompatible('Optional', 'String?')).toBe(true);
  });

  it('Array with []', () => {
    expect(isTypeCompatible('Array', '[UInt64]')).toBe(true);
    expect(isTypeCompatible('Array', '[String]')).toBe(true);
  });

  it('Dictionary with {}', () => {
    expect(isTypeCompatible('Dictionary', '{String: UInt8}')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateArgsWithCode — without LSP (regex fallback)
// ---------------------------------------------------------------------------

describe('validateArgsWithCode — regex fallback', () => {
  it('valid script args', async () => {
    const code = 'access(all) fun main(recipient: Address, amount: UFix64): Void { }';
    const args = [
      '{"type":"Address","value":"0x1654653399040a61"}',
      '{"type":"UFix64","value":"10.50000000"}',
    ];
    const result = await validateArgsWithCode(args, code);
    expect(result.valid).toBe(true);
    expect(result.parameters).toHaveLength(2);
    expect(result.parameters![0].name).toBe('recipient');
    expect(result.parameters![1].name).toBe('amount');
  });

  it('wrong argument count', async () => {
    const code = 'access(all) fun main(recipient: Address): Void { }';
    const args = [
      '{"type":"Address","value":"0x1654653399040a61"}',
      '{"type":"UFix64","value":"10.50000000"}',
    ];
    const result = await validateArgsWithCode(args, code);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Expected 1'))).toBe(true);
  });

  it('type mismatch', async () => {
    const code = 'access(all) fun main(amount: UFix64): Void { }';
    const args = ['{"type":"String","value":"hello"}'];
    const result = await validateArgsWithCode(args, code);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('expected UFix64, got String'))).toBe(true);
  });

  it('extra args marked', async () => {
    const code = 'access(all) fun main(a: UInt8): Void { }';
    const args = [
      '{"type":"UInt8","value":"1"}',
      '{"type":"UInt8","value":"2"}',
    ];
    const result = await validateArgsWithCode(args, code);
    expect(result.valid).toBe(false);
    expect(result.args[1].error).toContain('unexpected extra argument');
  });

  it('no entry function', async () => {
    const code = 'access(all) contract Foo { }';
    const args = ['{"type":"UInt8","value":"1"}'];
    const result = await validateArgsWithCode(args, code);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Could not extract'))).toBe(true);
  });

  it('empty args for no-param script', async () => {
    const code = 'access(all) fun main(): UInt8 { return 1 }';
    const result = await validateArgsWithCode([], code);
    expect(result.valid).toBe(true);
    expect(result.parameters).toHaveLength(0);
  });

  it('Optional param compatible', async () => {
    const code = 'access(all) fun main(name: String?): Void { }';
    const args = ['{"type":"Optional","value":null}'];
    const result = await validateArgsWithCode(args, code);
    expect(result.valid).toBe(true);
  });

  it('Array param compatible', async () => {
    const code = 'access(all) fun main(ids: [UInt64]): Void { }';
    const args = ['{"type":"Array","value":[{"type":"UInt64","value":"1"}]}'];
    const result = await validateArgsWithCode(args, code);
    expect(result.valid).toBe(true);
  });

  it('transaction args', async () => {
    const code = 'transaction(amount: UFix64) { prepare(signer: &Account) {} }';
    const args = ['{"type":"UFix64","value":"10.00000000"}'];
    const result = await validateArgsWithCode(args, code);
    expect(result.valid).toBe(true);
    expect(result.parameters![0].name).toBe('amount');
  });

  it('standalone validation errors propagate', async () => {
    const code = 'access(all) fun main(a: UInt8): Void { }';
    const args = ['{"type":"UInt8","value":"300"}'];
    const result = await validateArgsWithCode(args, code);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('out of range'))).toBe(true);
  });
});
