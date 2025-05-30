---
title: Booleans, Numeric Literals, and Integers
sidebar_position: 1
---

## Booleans

The two boolean values `true` and `false` have the type `Bool`.

## Numeric literals

Numbers can be written in various bases. Numbers are assumed to be decimal by default. Non-decimal literals have a specific prefix:

| Numeral system  | Prefix | Characters                                                            |
| :-------------- | :----- | :-------------------------------------------------------------------- |
| **Decimal**     | _None_ | one or more numbers (`0` to `9`)                                      |
| **Binary**      | `0b`   | one or more zeros or ones (`0` or `1`)                                |
| **Octal**       | `0o`   | one or more numbers in the range `0` to `7`                           |
| **Hexadecimal** | `0x`   | one or more numbers, or characters `a` to `f`, lowercase or uppercase |

```cadence
// A decimal number
//
1234567890  // is `1234567890`

// A binary number
//
0b101010  // is `42`

// An octal number
//
0o12345670  // is `2739128`

// A hexadecimal number
//
0x1234567890ABCabc  // is `1311768467294898876`

// Invalid: unsupported prefix 0z
//
0z0

// A decimal number with leading zeros. Not an octal number!
00123 // is `123`

// A binary number with several trailing zeros.
0b001000  // is `8`
```

Decimal numbers may contain underscores (`_`) to logically separate components:

```cadence
let largeNumber = 1_000_000

// Invalid: Value is not a number literal, but a variable.
let notNumber = _123
```

Underscores are allowed for all numeral systems:

```cadence
let binaryNumber = 0b10_11_01
```

## Integers

Integers are numbers without a fractional part. They are either _signed_ (positive, zero, or negative) or _unsigned_ (positive or zero).

Signed integer types that check for overflow and underflow have an `Int` prefix and can represent values in the following ranges:

- **`Int8`**: -2^7 through 2^7 − 1 (-128 through 127)
- **`Int16`**: -2^15 through 2^15 − 1 (-32768 through 32767)
- **`Int32`**: -2^31 through 2^31 − 1 (-2147483648 through 2147483647)
- **`Int64`**: -2^63 through 2^63 − 1 (-9223372036854775808 through 9223372036854775807)
- **`Int128`**: -2^127 through 2^127 − 1
- **`Int256`**: -2^255 through 2^255 − 1
- **`Int`**: unbounded

Unsigned integer types that check for overflow and underflow have a `UInt` prefix and can represent values in the following ranges:

- **`UInt8`**: 0 through 2^8 − 1 (255)
- **`UInt16`**: 0 through 2^16 − 1 (65535)
- **`UInt32`**: 0 through 2^32 − 1 (4294967295)
- **`UInt64`**: 0 through 2^64 − 1 (18446744073709551615)
- **`UInt128`**: 0 through 2^128 − 1
- **`UInt256`**: 0 through 2^256 − 1
- **`UInt`**: unbounded >= 0

Unsigned integer types that do **not** check for overflow and underflow (i.e., wrap around) include the `Word` prefix and can represent values in the following ranges:

- **`Word8`**: 0 through 2^8 − 1 (255)
- **`Word16`**: 0 through 2^16 − 1 (65535)
- **`Word32`**: 0 through 2^32 − 1 (4294967295)
- **`Word64`**: 0 through 2^64 − 1 (18446744073709551615)
- **`Word128`**: 0 through 2^128 − 1 (340282366920938463463374607431768211455)
- **`Word256`**: 0 through 2^256 − 1 (115792089237316195423570985008687907853269984665640564039457584007913129639935)

The types are independent types (i.e., they are not subtypes of each other).

See the section about [arithmetic operators] for further information about the behavior of the different integer types.

```cadence
// Declare a constant that has type `UInt8` and the value 10.
let smallNumber: UInt8 = 10
```

```cadence
// Invalid: negative literal cannot be used as an unsigned integer
//
let invalidNumber: UInt8 = -10
```

As shown above, there are two arbitrary precision integer types, `Int` and `UInt`:

```cadence
let veryLargeNumber: Int = -10000000000000000000000000000000
let veryLargeNonNegativeNumber: UInt = 10000000000000000000000000000000
```

Integer literals are [inferred] to have type `Int`, or if the literal occurs in a position that expects an explicit type (e.g., in a variable declaration with an explicit type annotation):

```cadence
let someNumber = 123

// `someNumber` has type `Int`
```

Negative integers are encoded in two's complement representation.

Integer types are not converted automatically. Types must be explicitly converted, which can be done by calling the constructor of the type with the integer type:

```cadence
let x: Int8 = 1
let y: Int16 = 2

// Invalid: the types of the operands, `Int8` and `Int16` are incompatible.
let z = x + y

// Explicitly convert `x` from `Int8` to `Int16`.
let a = Int16(x) + y

// `a` has type `Int16`

// Invalid: The integer literal is expected to be of type `Int8`,
// but the large integer literal does not fit in the range of `Int8`.
//
let b = x + 1000000000000000000000000
```

### Integer functions

Integers have multiple built-in functions you can use.

-
    ```cadence
    view fun toString(): String
    ```

    Returns the string representation of the integer.

    ```cadence
    let answer = 42

    answer.toString()  // is "42"
    ```

-
    ```cadence
    view fun toBigEndianBytes(): [UInt8]
    ```

    Returns the byte array representation (`[UInt8]`) in big-endian order of the integer.

    ```cadence
    let largeNumber = 1234567890

    largeNumber.toBigEndianBytes()  // is `[73, 150, 2, 210]`
    ```

All integer types support the following functions:

-
    ```cadence
    view fun T.fromString(_ input: String): T?
    ```

    Attempts to parse an integer value from a base-10 encoded string, returning `nil` if the string is invalid.

    For a given integer `n` of type `T`, `T.fromString(n.toString())` is equivalent to wrapping `n` up in an [optional].

    Strings are invalid if:

      - they contain non-digit characters.
      - they don't fit in the target type.

    For signed integer types like `Int64` and `Int`, the string may optionally begin with a `+` or `-` sign prefix.

    For unsigned integer types like `Word64`, `UInt64`, and `UInt`, sign prefices are not allowed.

    Examples:

    ```cadence
    let fortyTwo: Int64? = Int64.fromString("42") // ok

    let twenty: UInt? = UInt.fromString("20") // ok

    let nilWord: Word8? = Word8.fromString("1024") // nil, out of bounds

    let negTwenty: Int? = Int.fromString("-20") // ok
    ```

-
    ```cadence
    view fun T.fromBigEndianBytes(_ bytes: [UInt8]): T?
    ```

    Attempts to parse an integer value from a byte array representation (`[UInt8]`) in big-endian order, returning `nil` if the input bytes are invalid.

    For a given integer `n` of type `T`, `T.fromBigEndianBytes(n.toBigEndianBytes())` is equivalent to wrapping `n` up in an [optional].

    The bytes are invalid if:

      - the length of the bytes array exceeds the number of bytes needed for the target type.
      - they don't fit in the target type.

    Examples:

    ```cadence
    let fortyTwo: UInt32? = UInt32.fromBigEndianBytes([42]) // ok

    let twenty: UInt? = UInt.fromBigEndianBytes([0, 0, 20]) // ok

    let nilWord: Word8? = Word8.fromBigEndianBytes("[0, 22, 0, 0, 0, 0, 0, 0, 0]") // nil, out of bounds

    let nilWord2: Word8? = Word8.fromBigEndianBytes("[0, 0]") // nil, size (2) exceeds number of bytes needed for Word8 (1)

    let negativeNumber: Int64? = Int64.fromBigEndianBytes([128, 0, 0, 0, 0, 0, 0, 1]) // ok -9223372036854775807
    ```

<!-- Relative links. Will not render on the page -->

[arithmetic operators]: ../operators.md#arithmetic-operators
[inferred]: ../type-inference.md
[optional]: ./anystruct-anyresource-opts-never.md#optionals