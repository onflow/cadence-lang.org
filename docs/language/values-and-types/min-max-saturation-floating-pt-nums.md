---
title: Minimum and Maximum Values, Saturation Arithmetic, and Floating-Point Numbers
sidebar_position: 3
---

## Minimum and maximum values

The minimum and maximum values for all integer and fixed-point number types are available through the fields `min` and `max`.

For example:

```cadence
let max = UInt8.max
// `max` is 255, the maximum value of the type `UInt8`
```

```cadence
let max = UFix64.max
// `max` is 184467440737.09551615, the maximum value of the type `UFix64`
```

## Saturation arithmetic

Integers and fixed-point numbers support saturation arithmetic, which means that arithmetic operations, such as addition or multiplications, are saturating at the numeric bounds instead of overflowing.

- If the result of an operation is greater than the maximum value of the operands' type, the maximum is returned.
- If the result is lower than the minimum of the operands' type, the minimum is returned.

Saturating addition, subtraction, multiplication, and division are provided as functions with the prefix `saturating`:

- `Int8`, `Int16`, `Int32`, `Int64`, `Int128`, `Int256`, `Fix64`:

  - `saturatingAdd`
  - `saturatingSubtract`
  - `saturatingMultiply`
  - `saturatingDivide`

- `Int`:

  - none

- `UInt8`, `UInt16`, `UInt32`, `UInt64`, `UInt128`, `UInt256`, `UFix64`:

  - `saturatingAdd`
  - `saturatingSubtract`
  - `saturatingMultiply`

- `UInt`:
  - `saturatingSubtract`

```cadence
let a: UInt8 = 200
let b: UInt8 = 100
let result = a.saturatingAdd(b)
// `result` is 255, the maximum value of the type `UInt8`
```

## Floating-point numbers

There is **no** support for floating point numbers.

Smart Contracts are not intended to work with values that include error margins and therefore floating point arithmetic is not appropriate here.

Instead, consider using [fixed point numbers].

<!-- Relative links. Will not render on the page -->

[fixed point numbers]: ./fixed-point-nums-ints.md