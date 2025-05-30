---
title: Arrays
sidebar_position: 7
---

Arrays consist of the following:

- Arrays are mutable, ordered collections of values.
- Arrays may contain a value multiple times.
- Array literals start with an opening square bracket `[` and end with a closing square bracket `]`.

```cadence
// An empty array
//
[]

// An array with integers
//
[1, 2, 3]
```

## Array types

Arrays either have a fixed size or are variably sized (i.e., elements can be added and removed).

Fixed-size array types have the form `[T; N]`, where `T` is the element type and `N` is the size of the array. `N` must be statically known, meaning that it needs to be an integer literal. For example, a fixed-size array of 3 `Int8` elements has the type `[Int8; 3]`.

Variable-size array types have the form `[T]`, where `T` is the element type. For example, the type `[Int16]` specifies a variable-size array of elements that have type `Int16`.

All values in an array must have a type, which is a subtype of the array's element type (`T`).

It is important to understand that arrays are value types and are only ever copied when used as an initial value for a constant or variable, when assigning to a variable, when used as function argument, or when returned from a function call.

```cadence
let size = 2
// Invalid: Array-size must be an integer literal
let numbers: [Int; size] = []

// Declare a fixed-sized array of integers
// which always contains exactly two elements.
//
let array: [Int8; 2] = [1, 2]

// Declare a fixed-sized array of fixed-sized arrays of integers.
// The inner arrays always contain exactly three elements,
// the outer array always contains two elements.
//
let arrays: [[Int16; 3]; 2] = [
    [1, 2, 3],
    [4, 5, 6]
]

// Declare a variable length array of integers
var variableLengthArray: [Int] = []

// Mixing values with different types is possible
// by declaring the expected array type
// with the common supertype of all values.
//
let mixedValues: [AnyStruct] = ["some string", 42]
```

Array types are covariant in their element types. For example, `[Int]` is a subtype of `[AnyStruct]`. This is safe because arrays are value types and not reference types.

## Array indexing

To get the element of an array at a specific index, the following indexing syntax can be used: the array is followed by an opening square bracket `[`, the indexing value, and ends with a closing square bracket `]`.

Indexes start at 0 for the first element in the array.

Accessing an element which is out of bounds results in a fatal error at run-time and aborts the program.

```cadence
// Declare an array of integers.
let numbers = [42, 23]

// Get the first number of the array.
//
numbers[0] // is `42`

// Get the second number of the array.
//
numbers[1] // is `23`

// Run-time error: Index 2 is out of bounds, the program aborts.
//
numbers[2]
```

```cadence
// Declare an array of arrays of integers, i.e. the type is `[[Int]]`.
let arrays = [[1, 2], [3, 4]]

// Get the first number of the second array.
//
arrays[1][0] // is `3`
```

To set an element of an array at a specific index, the indexing syntax can be used as well.

```cadence
// Declare an array of integers.
let numbers = [42, 23]

// Change the second number in the array.
//
// NOTE: The declaration `numbers` is constant, which means that
// the *name* is constant, not the *value* – the value, i.e. the array,
// is mutable and can be changed.
//
numbers[1] = 2

// `numbers` is `[42, 2]`
```

## Array fields and functions

Arrays have multiple built-in fields and functions that can be used to get information about and manipulate the contents of the array.

The field `length`, and the functions `concat`, and `contains` are available for both variable-sized and fixed-sized or variable-sized arrays.

-
    ```cadence
    let length: Int
    ```

    The number of elements in the array.

    ```cadence
    // Declare an array of integers.
    let numbers = [42, 23, 31, 12]

    // Find the number of elements of the array.
    let length = numbers.length

    // `length` is `4`
    ```

-
    ```cadence
    access(all)
    view fun concat(_ array: T): T
    ```

    Concatenates the parameter `array` to the end of the array the function is called on, but does not modify that array.

    Both arrays must be the same type `T`.

    This function creates a new array whose length is the sum of the length of the array the function is called on and the length of the array given as the parameter.

    ```cadence
    // Declare two arrays of integers.
    let numbers = [42, 23, 31, 12]
    let moreNumbers = [11, 27]

    // Concatenate the array `moreNumbers` to the array `numbers`
    // and declare a new variable for the result.
    //
    let allNumbers = numbers.concat(moreNumbers)

    // `allNumbers` is `[42, 23, 31, 12, 11, 27]`
    // `numbers` is still `[42, 23, 31, 12]`
    // `moreNumbers` is still `[11, 27]`
    ```

-
    ```cadence
    access(all)
    view fun contains(_ element: T): Bool
    ```

    Returns true if the given element of type `T` is in the array.

    ```cadence
    // Declare an array of integers.
    let numbers = [42, 23, 31, 12]

    // Check if the array contains 11.
    let containsEleven = numbers.contains(11)
    // `containsEleven` is `false`

    // Check if the array contains 12.
    let containsTwelve = numbers.contains(12)
    // `containsTwelve` is `true`

    // Invalid: Check if the array contains the string "Kitty".
    // This results in a type error, as the array only contains integers.
    //
    let containsKitty = numbers.contains("Kitty")
    ```

-
    ```cadence
    access(all)
    view fun firstIndex(of: T): Int?
    ```

    Returns the index of the first element matching the given object in the array, nil if no match. Available if `T` is not resource-kinded and equatable.

    ```cadence
     // Declare an array of integers.
     let numbers = [42, 23, 31, 12]

     // Check if the array contains 31
     let index = numbers.firstIndex(of: 31)
     // `index` is 2

     // Check if the array contains 22
     let index = numbers.firstIndex(of: 22)
     // `index` is nil
    ```

-
    ```cadence
    access(all)
    view fun slice(from: Int, upTo: Int): [T]
    ```

    Returns an array slice of the elements in the given array from start index `from` up to, but not including, the end index `upTo`. This function creates a new array whose length is `upTo - from`. It does not modify the original array. If either of the parameters are out of the bounds of the array, or the indices are invalid (`from > upTo`), then the function will fail.

    ```cadence
    let example = [1, 2, 3, 4]

    // Create a new slice of part of the original array.
    let slice = example.slice(from: 1, upTo: 3)
    // `slice` is now `[2, 3]`

    // Run-time error: Out of bounds index, the program aborts.
    let outOfBounds = example.slice(from: 2, upTo: 10)

    // Run-time error: Invalid indices, the program aborts.
    let invalidIndices = example.slice(from: 2, upTo: 1)
    ```

-
    ```cadence
    access(all)
    view fun reverse(): [T]
    ```

    Returns a new array with contents in the reversed order. Available if `T` is not resource-kinded.

    ```cadence
    let example = [1, 2, 3, 4]

    // Create a new array which is the reverse of the original array.
    let reversedExample = example.reverse()
    // `reversedExample` is now `[4, 3, 2, 1]`
    ```

    ```cadence
    access(all)
    view fun reverse(): [T; N]
    ```

    Returns a new fixed-sized array of same size with contents in the reversed order.
    
    ```cadence
    let fixedSizedExample: [String; 3] = ["ABC", "XYZ", "PQR"]

    // Create a new array which is the reverse of the original array.
    let fixedArrayReversedExample = fixedSizedExample.reverse()
    // `fixedArrayReversedExample` is now `["PQR", "XYZ", "ABC"]`
    ```

-
    ```cadence
    access(all)
    fun map(_ f: fun(T): U): [U]
    ```

    Returns a new array whose elements are produced by applying the mapper function on each element of the original array. Available if `T` is not resource-kinded.

    ```cadence
    let example = [1, 2, 3]
    let trueForEven =
        fun (_ x: Int): Bool {
            return x % 2 == 0
        }

    let mappedExample: [Bool] = example.map(trueForEven)
    // `mappedExample` is `[False, True, False]`
    // `example` still remains as `[1, 2, 3]`

    // Invalid: Map using a function which accepts a different type.
    // This results in a type error, as the array contains `Int` values while function accepts 
    // `Int64`.
    let functionAcceptingInt64 =
        fun (_ x: Int64): Bool {
            return x % 2 == 0
        }
    let invalidMapFunctionExample = example.map(functionAcceptingInt64)
    ```

    The `map` function is also available for fixed-sized arrays:

    ```cadence
    access(all)
    fun map(_ f: fun(T): U): [U; N]
    ```

    Returns a new fixed-sized array whose elements are produced by applying the mapper function on each element of the original array. Available if `T` is not resource-kinded.

    ```cadence
    let fixedSizedExample: [String; 3] = ["ABC", "XYZYX", "PQR"]
    let lengthOfString =
        fun (_ x: String): Int {
            return x.length
        }

    let fixedArrayMappedExample = fixedSizedExample.map(lengthOfString)
    // `fixedArrayMappedExample` is now `[3, 5, 3]`
    // `fixedSizedExample` still remains as ["ABC", "XYZYX", "PQR"]

    // Invalid: Map using a function which accepts a different type.
    // This results in a type error, as the array contains `String` values while function accepts 
    // `Bool`.
    let functionAcceptingBool =
        fun (_ x: Bool): Int {
            return 0
        }
    let invalidMapFunctionExample = fixedSizedExample.map(functionAcceptingBool)
    ```

-
    ```cadence
    access(all)
    view fun filter(_ f: view fun(T): Bool): [T]
    ```

    Returns a new array whose elements are filtered by applying the filter function on each element of the original array. Available if `T` is not resource-kinded.

    ```cadence
    let example = [1, 2, 3]
    let trueForEven =
        fun (_ x: Int): Bool {
            return x % 2 == 0
        }

    let filteredExample: [Int] = example.filter(trueForEven)
    // `filteredExample` is `[2]`
    // `example` still remains as `[1, 2, 3]`

    // Invalid: Filter using a function which accepts a different type.
    // This results in a type error, as the array contains `Int` values while function accepts 
    // `Int64`.
    let functionAcceptingInt64 =
        fun (_ x: Int64): Bool {
            return x % 2 == 0
        }
    let invalidFilterFunctionExample = example.filter(functionAcceptingInt64)
    ```

    The `filter` function is also available for fixed-sized arrays:

    ```cadence
    access(all)
    view fun filter(_ f: view fun(T): Bool): [T]
    ```

    Returns a new **variable-sized** array whose elements are filtered by applying the filter function on each element of the original array. Available if `T` is not resource-kinded.

    ```cadence
    let fixedSizedExample: [String; 3] = ["AB", "XYZYX", "PQR"]
    let lengthOfStringGreaterThanTwo =
        fun (_ x: String): Bool {
            return x.length > 2
        }

    let fixedArrayFilteredExample = fixedSizedExample.filter(lengthOfStringGreaterThanTwo)
    // `fixedArrayFilteredExample` is `["XYZYX", "PQR"]`
    // `fixedSizedExample` still remains as ["AB", "XYZYX", "PQR"]

    // Invalid: Filter using a function which accepts a different type.
    // This results in a type error, as the array contains `String` values while function accepts 
    // `Bool`.
    let functionAcceptingBool =
        fun (_ x: Bool): Bool {
            return True
        }
    let invalidFilterFunctionExample = fixedSizedExample.filter(functionAcceptingBool)
    ```

## Variable-size array functions

The following functions can only be used on variable-sized arrays. It is invalid to use one of these functions on a fixed-sized array.

-
    ```cadence
    access(Mutate | Insert)
    fun append(_ element: T): Void
    ```

    Adds the new element `element` of type `T` to the end of the array.

    The new element must be the same type as all the other elements in the array.

    This function [mutates] the array.

    ```cadence
    // Declare an array of integers.
    let numbers = [42, 23, 31, 12]

    // Add a new element to the array.
    numbers.append(20)
    // `numbers` is now `[42, 23, 31, 12, 20]`

    // Invalid: The parameter has the wrong type `String`.
    numbers.append("SneakyString")
    ```

-
    ```cadence
    access(Mutate | Insert)
    fun appendAll(_ array: T): Void
    ```

    Adds all the elements from `array` to the end of the array the function is called on.

    Both arrays must be the same type `T`.

    This function [mutates] the array.

    ```cadence
    // Declare an array of integers.
    let numbers = [42, 23]

    // Add new elements to the array.
    numbers.appendAll([31, 12, 20])
    // `numbers` is now `[42, 23, 31, 12, 20]`

    // Invalid: The parameter has the wrong type `[String]`.
    numbers.appendAll(["Sneaky", "String"])
    ```

-
    ```cadence
    access(Mutate | Insert)
    fun insert(at: Int, _ element: T): Void
    ```

    Inserts the new element `element` of type `T` at the given `index` of the array.

    The new element must be of the same type as the other elements in the array.

    The `index` must be within the bounds of the array. If the index is outside the bounds, the program aborts.

    The existing element at the supplied index is not overwritten.

    All the elements after the new inserted element are shifted to the right by one.

    This function [mutates] the array.

    ```cadence
    // Declare an array of integers.
    let numbers = [42, 23, 31, 12]

    // Insert a new element at position 1 of the array.
    numbers.insert(at: 1, 20)
    // `numbers` is now `[42, 20, 23, 31, 12]`

    // Run-time error: Out of bounds index, the program aborts.
    numbers.insert(at: 12, 39)
    ```
-
    ```cadence
    access(Mutate | Remove)
    fun remove(at: Int): T
    ```

    Removes the element at the given `index` from the array and returns it.

    The `index` must be within the bounds of the array. If the index is outside the bounds, the program aborts.

    This function [mutates] the array.

    ```cadence
    // Declare an array of integers.
    let numbers = [42, 23, 31]

    // Remove element at position 1 of the array.
    let twentyThree = numbers.remove(at: 1)
    // `numbers` is now `[42, 31]`
    // `twentyThree` is `23`

    // Run-time error: Out of bounds index, the program aborts.
    numbers.remove(at: 19)
    ```

-
    ```cadence
    access(Mutate | Remove)
    fun removeFirst(): T
    ```

    Removes the first element from the array and returns it.

    The array must not be empty. If the array is empty, the program aborts.

    This function [mutates] the array.

    ```cadence
    // Declare an array of integers.
    let numbers = [42, 23]

    // Remove the first element of the array.
    let fortytwo = numbers.removeFirst()
    // `numbers` is now `[23]`
    // `fortywo` is `42`

    // Remove the first element of the array.
    let twentyThree = numbers.removeFirst()
    // `numbers` is now `[]`
    // `twentyThree` is `23`

    // Run-time error: The array is empty, the program aborts.
    numbers.removeFirst()
    ```

-
    ```cadence
    access(Mutate | Remove)
    fun removeLast(): T
    ```

    Removes the last element from the array and returns it.

    The array must not be empty. If the array is empty, the program aborts.

    This function [mutates] the array.

    ```cadence
    // Declare an array of integers.
    let numbers = [42, 23]

    // Remove the last element of the array.
    let twentyThree = numbers.removeLast()
    // `numbers` is now `[42]`
    // `twentyThree` is `23`

    // Remove the last element of the array.
    let fortyTwo = numbers.removeLast()
    // `numbers` is now `[]`
    // `fortyTwo` is `42`

    // Run-time error: The array is empty, the program aborts.
    numbers.removeLast()
    ```

<!-- Relative links. Will not render on the page -->

[mutates]: ../access-control.md