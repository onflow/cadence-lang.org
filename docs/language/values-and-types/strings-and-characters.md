---
title: Strings and Characters
sidebar_position: 6
---

Strings and characters are used as follows:

- Strings are collections of characters.
- Strings have the type `String` and characters have the type `Character`.
- Strings can be used to work with text in a Unicode-compliant way.
- Strings are immutable.

String and character literals are enclosed in double quotation marks (`"`):

```cadence
let someString = "Hello, world!"
```

String literals may contain escape sequences. An escape sequence starts with a backslash (`\`):

- `\0`: Null character
- `\\`: Backslash
- `\t`: Horizontal tab
- `\n`: Line feed
- `\r`: Carriage return
- `\"`: Double quotation mark
- `\'`: Single quotation mark
- `\u`: A Unicode scalar value, written as `\u{x}`, where `x` is a 1–8 digit hexadecimal number, which needs to be a valid Unicode scalar value (i.e., in the range 0 to 0xD7FF and 0xE000 to 0x10FFFF inclusive).

```cadence
// Declare a constant which contains two lines of text
// (separated by the line feed character `\n`), and ends
// with a thumbs up emoji, which has code point U+1F44D (0x1F44D).
//
let thumbsUpText =
    "This is the first line.\nThis is the second line with an emoji: \u{1F44D}"
```

The type `Character` represents a single, human-readable character. Characters are extended grapheme clusters, which consist of one or more Unicode scalars.

For example, the single character `ü` can be represented in several ways in Unicode. First, it can be represented by a single Unicode scalar value `ü` ("LATIN SMALL LETTER U WITH DIAERESIS", code point U+00FC). Second, the same single character can be represented by two Unicode scalar values: `u` ("LATIN SMALL LETTER U", code point U+0075), and "COMBINING DIAERESIS" (code point U+0308). The combining Unicode scalar value is applied to the scalar before it, which turns a `u` into a `ü`.

Still, both variants represent the same human-readable character `ü`:

```cadence
let singleScalar: Character = "\u{FC}"
// `singleScalar` is `ü`
let twoScalars: Character = "\u{75}\u{308}"
// `twoScalars` is `ü`
```

Another example where multiple Unicode scalar values are rendered as a single, human-readable character is a flag emoji. These emojis consist of two "REGIONAL INDICATOR SYMBOL LETTER" Unicode scalar values:

```cadence
// Declare a constant for a string with a single character, the emoji
// for the Canadian flag, which consists of two Unicode scalar values:
// - REGIONAL INDICATOR SYMBOL LETTER C (U+1F1E8)
// - REGIONAL INDICATOR SYMBOL LETTER A (U+1F1E6)
//
let canadianFlag: Character = "\u{1F1E8}\u{1F1E6}"
// `canadianFlag` is `🇨🇦`
```

## String templates / String Interpolation

String templates, or string interpolation, allow constants, variables, and expressions to be inlined into strings simplifying the process of constructing dynamic strings. String templates are currently supported in single-line literals by wrapping the target in parentheses and prefixing it with a backslash (`\`).

The target in the parentheses must support the built-in function `toString()`, meaning it must evaluate to a `String`, `Number`, `Address`, `Character`, `Bool` or `Path`. Carriage returns, line feeds and nested string literals are not supported inside the parentheses.

```cadence
let result = 2 + 2
let template: String = "2 + 2 = \(result)" // `template` is `2 + 2 = 4`
// Invalid: Empty string template
let empty: String = "\()"
// Invalid: Nested string template
let nested: String = "outer string \( "\(inner template)" )"
// Invalid: Unsupported type
let x: [AnyStruct] = ["tmp", 1]
let arr: String = "\(x)"
```

## String fields and functions

Strings have multiple built-in functions you can use:

- ```cadence
  let length: Int
  ```

  Returns the number of characters in the string as an integer.

  ```cadence
  let example = "hello"

  // Find the number of elements of the string.
  let length = example.length
  // `length` is `5`
  ```

- ```cadence
  let utf8: [UInt8]
  ```

  The byte array of the UTF-8 encoding.

  ```cadence
  let flowers = "Flowers \u{1F490}"
  let bytes = flowers.utf8
  // `bytes` is `[70, 108, 111, 119, 101, 114, 115, 32, 240, 159, 146, 144]`
  ```

- ```cadence
  view fun concat(_ other: String): String
  ```

  Concatenates the string `other` to the end of the original string, but does not modify the original string. This function creates a new string whose length is the sum of the lengths of the string the function is called on and the string given as a parameter.

  ```cadence
  let example = "hello"
  let new = "world"

  // Concatenate the new string onto the example string and return the new string.
  let helloWorld = example.concat(new)
  // `helloWorld` is now `"helloworld"`
  ```

- ```cadence
  view fun slice(from: Int, upTo: Int): String
  ```

  Returns a string slice of the characters in the given string from start index `from` up to, but not including, the end index `upTo`. This function creates a new string whose length is `upTo - from`. It does not modify the original string. If either of the parameters are out of the bounds of the string, or the indices are invalid (`from > upTo`), then the function will fail.

  ```cadence
  let example = "helloworld"

  // Create a new slice of part of the original string.
  let slice = example.slice(from: 3, upTo: 6)
  // `slice` is now `"low"`

  // Run-time error: Out of bounds index, the program aborts.
  let outOfBounds = example.slice(from: 2, upTo: 10)

  // Run-time error: Invalid indices, the program aborts.
  let invalidIndices = example.slice(from: 2, upTo: 1)
  ```

- ```cadence
  view fun decodeHex(): [UInt8]
  ```

  Returns an array containing the bytes represented by the given hexadecimal string.

  The given string must only contain hexadecimal characters and must have an even length.
  If the string is malformed, the program aborts.

  ```cadence
  let example = "436164656e636521"

  example.decodeHex()  // is `[67, 97, 100, 101, 110, 99, 101, 33]`
  ```

- ```cadence
  view fun toLower(): String
  ```

  Returns a string where all upper case letters are replaced with lowercase characters.

  ```cadence
  let example = "Flowers"

  example.toLower()  // is `flowers`
  ```

- ```cadence
  view fun replaceAll(of: String, with: String): String
  ```

  Returns a string where all occurences of `of` are replaced with `with`. If `of` is empty, it matches at the beginning of the string and after each UTF-8 sequence yielding k+1 replacements for a string of length k.

  ```cadence
  let example = "abababa"

  example.replaceAll(of: "a", with: "o")  // is `obobobo`
  ```

- ```cadence
  view fun split(separator: String): [String]
  ```

  Returns the variable-sized array of strings created splitting the receiver string on the `separator`.

  ```cadence
  let example = "hello world"

  example.split(separator: " ")  // is `["hello", "world"]`
  ```

The `String` type also provides the following functions:

- ```cadence
  view fun String.encodeHex(_ data: [UInt8]): String
  ```

  Returns a hexadecimal string for the given byte array

  ```cadence
  let data = [1 as UInt8, 2, 3, 0xCA, 0xDE]

  String.encodeHex(data)  // is `"010203cade"`
  ```

- ```cadence
  view fun String.join(_ strings: [String], separator: String): String
  ```

  Returns the string created by joining the array of `strings` with the provided `separator`.

  ```cadence
  let strings = ["hello", "world"]
  String.join(strings, " ") // is "hello world"
  ```

`String`s are also indexable, returning a `Character` value.

```cadence
let str = "abc"
let c = str[0] // is the Character "a"
```

- ```cadence
  view fun String.fromUTF8(_ input: [UInt8]): String?
  ```

  Attempts to convert a UTF-8 encoded byte array into a `String`. This function returns `nil` if the byte array contains invalid UTF-8,
  such as incomplete codepoint sequences or undefined graphemes.

  For a given string `s`, `String.fromUTF8(s.utf8)` is equivalent to wrapping `s` up in an [optional].

## Character fields and functions

`Character` values can be converted into `String` values using the `toString` function:

- ```cadence
  view fun toString(): String`
  ```

  Returns the string representation of the character.

  ```cadence
  let c: Character = "x"

  c.toString()  // is "x"
  ```

- ```cadence
  view fun String.fromCharacters(_ characters: [Character]): String
  ```

  Builds a new `String` value from an array of `Character`s. Because `String`s are immutable, this operation makes a copy of the input array.

  ```cadence
  let rawUwU: [Character] = ["U", "w", "U"]
  let uwu: String = String.fromCharacters(rawUwU) // "UwU"
  ```

- ```cadence
  let utf8: [UInt8]
  ```

  The byte array of the UTF-8 encoding.

  ```cadence
  let a: Character = "a"
  let a_bytes = a.utf8 // `a_bytes` is `[97]`

  let bouquet: Character = "\u{1F490}"
  let bouquet_bytes = bouquet.utf8 // `bouquet_bytes` is `[240, 159, 146, 144]`
  ```

<!-- Relative links. Will not render on the page -->

[optional]: ./anystruct-anyresource-opts-never.md#optionals
