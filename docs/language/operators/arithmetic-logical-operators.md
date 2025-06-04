---
title: Arithmetic and Logical Operators
sidebar_position: 2
---

## Arithmetic operators

The unary pefix operator  `-` negates an integer:

```cadence
let a = 1
-a  // is `-1`
```

There are four binary arithmetic operators:

- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`
- Remainder: `%`

```cadence
let a = 1 + 2
// `a` is `3`
```

The arguments for the operators need to be of the same type. The result is always the same type as the arguments.

The division and remainder operators abort the program when the divisor is zero.

Arithmetic operations on the signed integer types `Int8`, `Int16`, `Int32`, `Int64`, `Int128`, `Int256`, and on the unsigned integer types `UInt8`, `UInt16`, `UInt32`, `UInt64`, `UInt128`, and `UInt256` do not cause values to overflow or underflow - the program will abort with a fatal overflow error.

```cadence
let a: UInt8 = 255

// Run-time error: The result `256` does not fit in the range of `UInt8`,
// thus a fatal overflow error is raised and the program aborts
//
let b = a + 1
```

```cadence
let a: Int8 = 100
let b: Int8 = 100

// Run-time error: The result `10000` does not fit in the range of `Int8`,
// thus a fatal overflow error is raised and the program aborts
//
let c = a * b
```

```cadence
let a: Int8 = -128

// Run-time error: The result `128` does not fit in the range of `Int8`,
// thus a fatal overflow error is raised and the program aborts
//
let b = -a
```

Arithmetic operations on the unsigned integer types `Word8`, `Word16`, `Word32`, and `Word64` **can cause values to overflow or underflow**.

For example, the maximum value of an unsigned 8-bit integer is 255 (binary 11111111). Adding 1 results in an overflow, truncation to 8 bits, and the value 0:

```cadence
//    11111111 = 255
// +         1
// = 100000000 = 0
```

```cadence
let a: Word8 = 255
a + 1 // is `0`
```

Similarly, for the minimum value 0, subtracting 1 wraps around and results in the maximum value 255:

```cadence
//    00000000
// -         1
// =  11111111 = 255
```

```cadence
let b: Word8 = 0
b - 1  // is `255`
```

### Arithmetics on number super-types

Arithmetic operators are not supported for number supertypes (`Number`, `SignedNumber`, `FixedPoint`, `SignedFixedPoint`, `Integer`, and `SignedInteger`), as they may or may not succeed at run-time:

```cadence
let x: Integer = 3 as Int8
let y: Integer = 4 as Int8

let z: Integer = x + y    // Static error
```

Values of these types must be cast to the desired type before performing the arithmetic operation:

```cadence
let z: Integer = (x as! Int8) + (y as! Int8)
```

## Logical operators

Logical operators work with the boolean values `true` and `false`.

- Logical NOT: `!a`

  This unary prefix operator logically negates a boolean:

  ```cadence
  let a = true
  !a  // is `false`
  ```

- Logical AND: `a && b`

  ```cadence
  true && true  // is `true`

  true && false  // is `false`

  false && true  // is `false`

  false && false  // is `false`
  ```

  If the left-hand side is false, the right-hand side is not evaluated.

- Logical OR: `a || b`

  ```cadence
  true || true  // is `true`

  true || false  // is `true`

  false || true  // is `true`

  false || false // is `false`
  ```

  If the left-hand side is true, the right-hand side is not evaluated.

  <!-- Relative links. Will not render on the page -->
  
  