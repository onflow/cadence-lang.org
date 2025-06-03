---
title: Comparison Operators
sidebar_position: 3
---

Comparison operators work with boolean and integer values.

## Equality `==`

- Equality: `==` is supported for booleans, numbers, addresses, strings, characters, enums, paths, `Type` values, references, and `Void` values (`()`). Variable-sized arrays, fixed-size arrays, dictionaries, and optionals also support equality tests if their inner types do.

  Both sides of the equality operator may be optional, even of different levels; for example, it is possible to compare a non-optional with a double-optional (`??`):

  ```cadence
  1 == 1  // is `true`

  1 == 2  // is `false`
  ```

  ```cadence
  true == true  // is `true`

  true == false  // is `false`
  ```

  ```cadence
  let x: Int? = 1
  x == nil  // is `false`
  ```

  ```cadence
  let x: Int = 1
  x == nil  // is `false`
  ```

  ```cadence
  // Comparisons of different levels of optionals are possible.
  let x: Int? = 2
  let y: Int?? = nil
  x == y  // is `false`
  ```

  ```cadence
  // Comparisons of different levels of optionals are possible.
  let x: Int? = 2
  let y: Int?? = 2
  x == y  // is `true`
  ```

  ```cadence
  // Equality tests of arrays are possible if their inner types are equatable.
  let xs: [Int] = [1, 2, 3]
  let ys: [Int] = [1, 2, 3]
  xs == ys // is `true`

  let xss: [[Int]] = [xs, xs, xs]
  let yss: [[Int]] = [ys, ys, ys]
  xss == yss // is `true`
  ```

  ```cadence
  // Equality also applies to fixed-size arrays. If their lengths differ, the result is a type error.
  let xs: [Int; 2] = [1, 2]
  let ys: [Int; 2] = [0 + 1, 1 + 1]
  xs == ys // is `true`
  ```

  ```cadence
  // Equality tests of dictionaries are possible if the key and value types are equatable.
  let d1 = {"abc": 1, "def": 2}
  let d2 = {"abc": 1, "def": 2}
  d1 == d2 // is `true`

  let d3 = {"abc": {1: {"a": 1000}, 2: {"b": 2000}}, "def": {4: {"c": 1000}, 5: {"d": 2000}}}
  let d4 = {"abc": {1: {"a": 1000}, 2: {"b": 2000}}, "def": {4: {"c": 1000}, 5: {"d": 2000}}}
  d3 == d4 // is `true`
  ```

## Inequality `!=`

- Inequality: `!=` is supported for booleans, numbers, addresses, strings, characters, enums, paths, `Type` values, references, and `Void` values (`()`). Variable-sized arrays, fixed-size arrays, dictionaries, and optionals also support inequality tests if their inner types do.

  Both sides of the inequality operator may be optional, even of different levels; for example, it is possible to compare a non-optional with a double-optional (`??`):

  ```cadence
  1 != 1  // is `false`

  1 != 2  // is `true`
  ```

  ```cadence
  true != true  // is `false`

  true != false  // is `true`
  ```

  ```cadence
  let x: Int? = 1
  x != nil  // is `true`
  ```

  ```cadence
  let x: Int = 1
  x != nil  // is `true`
  ```

  ```cadence
  // Comparisons of different levels of optionals are possible.
  let x: Int? = 2
  let y: Int?? = nil
  x != y  // is `true`
  ```

  ```cadence
  // Comparisons of different levels of optionals are possible.
  let x: Int? = 2
  let y: Int?? = 2
  x != y  // is `false`
  ```

  ```cadence
  // Inequality tests of arrays are possible if their inner types are equatable.
  let xs: [Int] = [1, 2, 3]
  let ys: [Int] = [4, 5, 6]
  xs != ys // is `true`
  ```

  ```cadence
  // Inequality also applies to fixed-size arrays. If their lengths differ, the result is a type error.
  let xs: [Int; 2] = [1, 2]
  let ys: [Int; 2] = [1, 2]
  xs != ys // is `false`
  ```

  ```cadence
  // Inequality tests of dictionaries are possible if the key and value types are equatable.
  let d1 = {"abc": 1, "def": 2}
  let d2 = {"abc": 1, "def": 500}
  d1 != d2 // is `true`

  let d3 = {"abc": {1: {"a": 1000}, 2: {"b": 2000}}, "def": {4: {"c": 1000}, 5: {"d": 2000}}}
  let d4 = {"abc": {1: {"a": 1000}, 2: {"b": 2000}}, "def": {4: {"c": 1000}, 5: {"d": 2000}}}
  d3 != d4 // is `false`
  ```

## Less than `<`

- Less than: `<` is supported for integers, booleans, characters, and strings:

  ```cadence
  1 < 1  // is `false`

  1 < 2  // is `true`

  2 < 1  // is `false`

  false < true // is `true`

  true < true  // is `false`

  "a" < "b"    // is `true`

  "z" < "a"    // is `false`

  "a" < "A"    // is `false`

  "" < ""      // is `false`

  "" < "a"     // is `true`

  "az" < "b"   // is `true`

  "xAB" < "Xab"  // is `false`
  ```

## Less or equal than `<=`

- Less or equal than: `<=` is supported for integers, booleans, characters, and strings:

  ```cadence
  1 <= 1  // is `true`

  1 <= 2  // is `true`

  2 <= 1  // is `false`

  false <= true // is `true`

  true <= true  // is `true`

  true <= false // is `false`

  "c"  <= "a"   // is `false`

  "z"  <= "z"   // is `true`

  "a" <= "A"    // is `false`

  "" <= ""      // is `true`

  "" <= "a"     // is `true`

  "az" <= "b"   // is `true`

  "xAB" <= "Xab"  // is `false`
  ```

## Greater than `>`

- Greater than: `>` is supported for integers, booleans, characters, and strings:

  ```cadence
  1 > 1  // is `false`

  1 > 2  // is `false`

  2 > 1  // is `true`

  false > true // is `false`

  true > true  // is `false`

  true > false // is `true`

  "c"  > "a"   // is `true`

  "g"  > "g"   // is `false`

  "a" > "A"    // is `true`

  "" > ""      // is `false`

  "" > "a"     // is `false`

  "az" > "b"   // is `false`

  "xAB" > "Xab"  // is `true`
  ```

## Greater or equal than `>=`

- Greater or equal than: `>=` is supported for integers, booleans, characters, and strings:

  ```cadence
  1 >= 1  // is `true`

  1 >= 2  // is `false`

  2 >= 1  // is `true`

  false >= true // is `false`

  true >= true  // is `true`

  true >= false // is `true`

  "c"  >= "a"   // is `true`

  "q"  >= "q"   // is `true`

  "a" >= "A"    // is `true`

  "" >= ""      // is `true`

  "" >= "a"     // is `true`

  "az" >= "b"   // is `true`

  "xAB" >= "Xab"  // is `false`
  ```

### Comparing number super-types

Similar to arithmetic operators, comparison operators are also not supported for number supertypes (`Number`, `SignedNumber` `FixedPoint`, `SignedFixedPoint`, `Integer`, and `SignedInteger`), as they may or may not succeed at run-time:

```cadence
let x: Integer = 3 as Int8
let y: Integer = 4 as Int8

let z: Bool = x > y    // Static error
```

Values of these types must be cast to the desired type before performing the arithmetic operation:

```cadence
let z: Bool = (x as! Int8) > (y as! Int8)
```

<!-- Relative links. Will not render on the page -->

