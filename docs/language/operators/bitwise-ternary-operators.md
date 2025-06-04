---
title: Bitwise and Ternary Conditional Operators
sidebar_position: 4
---

## Bitwise operators

Bitwise operators enable the manipulation of individual bits of unsigned and signed integers. They're often used in low-level programming.

- Bitwise AND: `a & b`

  Returns a new integer whose bits are 1 only if the bits were 1 in *both* input integers:

  ```cadence
  let firstFiveBits = 0b11111000
  let lastFiveBits  = 0b00011111
  let middleTwoBits = firstFiveBits & lastFiveBits  // is 0b00011000
  ```

- Bitwise OR: `a | b`

  Returns a new integer whose bits are 1 only if the bits were 1 in *either* input integers:

  ```cadence
  let someBits = 0b10110010
  let moreBits = 0b01011110
  let combinedbits = someBits | moreBits  // is 0b11111110
  ```

- Bitwise XOR: `a ^ b`

  Returns a new integer whose bits are 1 where the input bits are different, and are 0 where the input bits are the same:

  ```cadence
  let firstBits = 0b00010100
  let otherBits = 0b00000101
  let outputBits = firstBits ^ otherBits  // is 0b00010001
  ```

### Bitwise shifting operators

- Bitwise LEFT SHIFT: `a << b`

  Returns a new integer with all bits moved to the left by a certain number of places:

  ```cadence
  let someBits = 4  // is 0b00000100
  let shiftedBits = someBits << 2   // is 0b00010000
  ```

- Bitwise RIGHT SHIFT: `a >> b`

  Returns a new integer with all bits moved to the right by a certain number of places:

  ```cadence
  let someBits = 8  // is 0b00001000
  let shiftedBits = someBits >> 2   // is 0b00000010
  ```

For unsigned integers, the bitwise shifting operators perform [logical shifting]; for signed integers, they perform [arithmetic shifting]. Also note that for `a << b` or `a >> b`, `b` must fit into a 64-bit integer.

## Ternary conditional operator

There is only one ternary conditional operator (e.g., `a ? b : c`).

It behaves like an if-statement, but is an expression: if the first operator value is true, the second operator value is returned. If the first operator value is false, the third value is returned.

The first value must be a boolean, or resolve to one (and must have the type `Bool`). The second value and third value can be of any type. The result type is the least common supertype of the second and third value.

```cadence
let x = 1 > 2 ? 3 : 4
// `x` is `4` and has type `Int`

let y = 1 > 2 ? nil : 3
// `y` is `3` and has type `Int?`
```

<!-- Relative links. Will not render on the page -->

[logical shifting]: https://en.wikipedia.org/wiki/Logical_shift
[arithmetic shifting]: https://en.wikipedia.org/wiki/Arithmetic_shift
