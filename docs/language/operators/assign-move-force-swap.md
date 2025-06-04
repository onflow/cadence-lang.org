---
title: Assignment, Move, Force-Assignment, and Swapping Operators
sidebar_position: 1
---

## Assignment operator (`=`)

The binary assignment operator `=` can be used to assign a new value to a variable. It is only allowed in a statement and is not allowed in expressions:

```cadence
var a = 1
a = 2
// `a` is `2`


var b = 3
var c = 4

// Invalid: The assignment operation cannot be used in an expression.
a = b = c

// Instead, the intended assignment must be written in multiple statements.
b = c
a = b
```

Assignments to constants are invalid.

```cadence
let a = 1
// Invalid: Assignments are only for variables, not constants.
a = 2
```

The left-hand side of the assignment operand must be an identifier. For arrays and dictionaries, this identifier can be followed by one or more index or access expressions.

```cadence
// Declare an array of integers.
let numbers = [1, 2]

// Change the first element of the array.
numbers[0] = 3

// `numbers` is `[3, 2]`
```

```cadence
// Declare an array of arrays of integers.
let arrays = [[1, 2], [3, 4]]

// Change the first element in the second array
//
arrays[1][0] = 5

// `arrays` is `[[1, 2], [5, 4]]`
```

```cadence
let dictionaries = {
  true: {1: 2},
  false: {3: 4}
}

dictionaries[false][3] = 0

// `dictionaries` is `{
//   true: {1: 2},
//   false: {3: 0}
//}`
```

## Move operator (`<-`)

The move operator (`<-`) is unique to Cadence and is used to move [resource types] from one location to another.  It works similar to the assignment operator (`=`) you're used to from most programming languages, except that the data in the location on the right side of the statement is **destroyed** by the operation:

```cadence
// Declare a resource named `SomeResource`, with a variable integer field.

access(all)
resource SomeResource {
    
    access(all)
    var value: Int

    init(value: Int) {
        self.value = value
    }
}

// Declare a constant with value of resource type `SomeResource`.

let a: @SomeResource <- create SomeResource(value: 5)

// *Move* the resource value to a new constant.

let b <- a

// Invalid Line Below: Cannot use constant `a` anymore as the resource that it
// referred to was moved to constant `b`.

a.value

// Constant `b` owns the resource.

b.value // equals 5
```

## Force-assignment operator (`<-!`)

The force-assignment operator (`<-!`) assigns a resource-typed value to an optional-typed variable if the variable is nil. If the variable being assigned to is non-nil, the execution of the program aborts.

The force-assignment operator is only used for [resource types].

## Swapping operator (`<->`)

The binary swap operator `<->` can be used to exchange the values of two variables. It is only allowed in a statement and is not allowed in expressions:

```cadence
var a = 1
var b = 2
a <-> b
// `a` is `2`
// `b` is `1`

var c = 3

// Invalid: The swap operation cannot be used in an expression.
a <-> b <-> c

// Instead, the intended swap must be written in multiple statements.
b <-> c
a <-> b
```

Both sides of the swap operation must be variable, assignment to constants is invalid.

```cadence
var a = 1
let b = 2

// Invalid: Swapping is only possible for variables, not constants.
a <-> b
```

Both sides of the swap operation must be an identifier, followed by one or more index or access expressions.

<!-- Relative links. Will not render on the page -->

[resource types]: ../resources.mdx
