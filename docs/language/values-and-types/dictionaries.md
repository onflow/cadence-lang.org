---
title: Dictionaries
sidebar_position: 8
---

Dictionaries are mutable, unordered collections of key-value associations. Dictionaries may contain a key only once and may contain a value multiple times.

- Dictionary literals start with an opening brace `{` and end with a closing brace `}`.
- Keys are separated from values by a colon, and key-value associations are separated by commas.

```cadence
// An empty dictionary
//
{}

// A dictionary which associates integers with booleans
//
{
    1: true,
    2: false
}
```

## Dictionary types

Dictionary types have the form `{K: V}`, where `K` is the type of the key, and `V` is the type of the value. For example, a dictionary with `Int` keys and `Bool` values has type `{Int: Bool}`.

In a dictionary, all keys must have a type that is a subtype of the dictionary's key type (`K`), and all values must have a type that is a subtype of the dictionary's value type (`V`).

```cadence
// Declare a constant that has type `{Int: Bool}`,
// a dictionary mapping integers to booleans.
//
let booleans = {
    1: true,
    0: false
}

// Declare a constant that has type `{Bool: Int}`,
// a dictionary mapping booleans to integers.
//
let integers = {
    true: 1,
    false: 0
}

// Mixing keys with different types, and mixing values with different types,
// is possible by declaring the expected dictionary type with the common supertype
// of all keys, and the common supertype of all values.
//
let mixedValues: {String: AnyStruct} = {
    "a": 1,
    "b": true
}
```

Dictionary types are covariant in their key and value types. For example, `{Int: String}` is a subtype of `{AnyStruct: String}` and also a subtype of `{Int: AnyStruct}`. This is safe because dictionaries are value types and not reference types.

## Dictionary Access

To get the value for a specific key from a dictionary, the following access syntax can be used: the dictionary is followed by an opening square bracket `[`, the key, and ends with a closing square bracket `]`.

Accessing a key returns an [optional]: if the key is found in the dictionary, the value for the given key is returned; and if the key is not found, `nil` is returned.

```cadence
// Declare a constant that has type `{Int: Bool}`,
// a dictionary mapping integers to booleans.
//
let booleans = {
    1: true,
    0: false
}

// The result of accessing a key has type `Bool?`.
//
booleans[1]  // is `true`
booleans[0]  // is `false`
booleans[2]  // is `nil`

// Invalid: Accessing a key which does not have type `Int`.
//
booleans["1"]
```

```cadence
// Declare a constant that has type `{Bool: Int}`,
// a dictionary mapping booleans to integers.
//
let integers = {
    true: 1,
    false: 0
}

// The result of accessing a key has type `Int?`
//
integers[true] // is `1`
integers[false] // is `0`
```

To set the value for a key of a dictionary, the access syntax can be used as well.

```cadence
// Declare a constant that has type `{Int: Bool}`,
// a dictionary mapping booleans to integers.
//
let booleans = {
    1: true,
    0: false
}

// Assign new values for the keys `1` and `0`.
//
booleans[1] = false
booleans[0] = true
// `booleans` is `{1: false, 0: true}`
```

## Dictionary fields and functions

-
    ```cadence
    let length: Int
    ```

    The number of entries in the dictionary.

    ```cadence
    // Declare a dictionary mapping strings to integers.
    let numbers = {"fortyTwo": 42, "twentyThree": 23}

    // Find the number of entries of the dictionary.
    let length = numbers.length

    // `length` is `2`
    ```

-
    ```cadence
    access(Mutate | Insert)
    fun insert(key: K, _ value: V): V?
    ```

    Inserts the given value of type `V` into the dictionary under the given `key` of type `K`.

    The inserted key must have the same type as the dictionary's key type, and the inserted value must have the same type as the dictionary's value type.

    Returns the previous value as an optional if the dictionary contained the key; otherwise, returns `nil`.

    Updates the value if the dictionary already contained the key.

    This function [mutates] the dictionary.

    ```cadence
    // Declare a dictionary mapping strings to integers.
    let numbers = {"twentyThree": 23}

    // Insert the key `"fortyTwo"` with the value `42` into the dictionary.
    // The key did not previously exist in the dictionary,
    // so the result is `nil`
    //
    let old = numbers.insert(key: "fortyTwo", 42)

    // `old` is `nil`
    // `numbers` is `{"twentyThree": 23, "fortyTwo": 42}`
    ```

-
    ```cadence
    access(Mutate | Remove)
    fun remove(key: K): V?
    ```

    Removes the value for the given `key` of type `K` from the dictionary.

    Returns the value of type `V` as an optional if the dictionary contained the key; otherwise, returns `nil`.

    This function [mutates] the dictionary.

    ```cadence
    // Declare a dictionary mapping strings to integers.
    let numbers = {"fortyTwo": 42, "twentyThree": 23}

    // Remove the key `"fortyTwo"` from the dictionary.
    // The key exists in the dictionary,
    // so the value associated with the key is returned.
    //
    let fortyTwo = numbers.remove(key: "fortyTwo")

    // `fortyTwo` is `42`
    // `numbers` is `{"twentyThree": 23}`

    // Remove the key `"oneHundred"` from the dictionary.
    // The key does not exist in the dictionary, so `nil` is returned.
    //
    let oneHundred = numbers.remove(key: "oneHundred")

    // `oneHundred` is `nil`
    // `numbers` is `{"twentyThree": 23}`
    ```

-
    ```cadence
    let keys: [K]
    ```

    Returns an array of the keys of type `K` in the dictionary. This does not modify the dictionary — it just returns a copy of the keys as an array. If the dictionary is empty, this returns an empty array. The ordering of the keys is undefined.

    ```cadence
    // Declare a dictionary mapping strings to integers.
    let numbers = {"fortyTwo": 42, "twentyThree": 23}

    // Find the keys of the dictionary.
    let keys = numbers.keys

    // `keys` has type `[String]` and is `["fortyTwo","twentyThree"]`
    ```

-
    ```cadence
    let values: [V]
    ```

    Returns an array of the values of type `V` in the dictionary. This does not modify the dictionary — it just returns a copy of the values as an array. If the dictionary is empty, this returns an empty array.

    This field is not available if `V` is a resource type.

    ```cadence
    // Declare a dictionary mapping strings to integers.
    let numbers = {"fortyTwo": 42, "twentyThree": 23}

    // Find the values of the dictionary.
    let values = numbers.values

    // `values` has type [Int] and is `[42, 23]`
    ```

-
    ```cadence
    access(all)
    view fun containsKey(key: K): Bool
    ```

    Returns true if the given key of type `K` is in the dictionary.

    ```cadence
    // Declare a dictionary mapping strings to integers.
    let numbers = {"fortyTwo": 42, "twentyThree": 23}

    // Check if the dictionary contains the key "twentyFive".
    let containsKeyTwentyFive = numbers.containsKey("twentyFive")
    // `containsKeyTwentyFive` is `false`

    // Check if the dictionary contains the key "fortyTwo".
    let containsKeyFortyTwo = numbers.containsKey("fortyTwo")
    // `containsKeyFortyTwo` is `true`

    // Invalid: Check if the dictionary contains the key 42.
    // This results in a type error, as the key type of the dictionary is `String`.
    //
    let containsKey42 = numbers.containsKey(42)
    ```

-
    ```cadence
    access(all)
    fun forEachKey(_ function: fun(K): Bool): Void
    ```

    Iterates through all the keys in the dictionary, exiting early if the passed function returns false. This is more efficient than calling `.keys` and iterating over the resulting array, since an intermediate allocation is avoided. The order of key iteration is undefined, similar to `.keys`.

    ```cadence
    // Take in a targetKey to look for, and a dictionary to iterate through.
    fun myContainsKey(targetKey: String, dictionary: {String: Int}) {
      // Declare an accumulator that we'll capture inside a closure.
      var found = false

      // At each step, `key` will be bound to another key from `dictionary`.
      dictionary.forEachKey(fun (key: String): Bool {
        found = key == targetKey

        // The returned boolean value, signals whether to continue iterating.
        // This allows for control flow during the iteration process:
        //  true = `continue`
        //  false = `break`
        return !found
      })

      return found
    }
    ```

## Dictionary keys

Dictionary keys must be hashable and equatable.

Most of the built-in types, like booleans and integers, are hashable and equatable, so can be used as keys in dictionaries.

A comprehensive list of valid dictionary key types:
- [Address]
- [Bool]
- [Character]
- [Enum]
- [Numbers]
- [Paths]
- [Runtime-types]
- [String]


<!-- Relative links. Will not render on the page -->

[optional]: ./anystruct-anyresource-opts-never.md#optionals
[mutates]: ../access-control.md
[Address]: ./addresses-functions.md
[Enum]: ../enumerations.md
[Bool]: ./booleans-numlits-ints.md#booleans
[Character]: ./strings-and-characters.md
[String]: ./strings-and-characters.md
[Runtime-types]: ../types-and-type-system/run-time-types.md
[Numbers]: ./booleans-numlits-ints.md#numeric-literals
[Paths]: ../accounts/paths.mdx