---
title: AnyStruct, AnyResource, Optionals, and Never
sidebar_position: 5
---

`AnyStruct` is the top type of all non-resource types (i.e., all non-resource types are a subtype of it).

`AnyResource` is the top type of all resource types.

```cadence
// Declare a variable that has the type `AnyStruct`.
// Any non-resource typed value can be assigned to it, for example an integer,
// but not resource-typed values.
//
var someStruct: AnyStruct = 1

// Assign a value with a different non-resource type, `Bool`.
someStruct = true

// Declare a structure named `TestStruct`, create an instance of it,
// and assign it to the `AnyStruct`-typed variable
//
struct TestStruct {}

let testStruct = TestStruct()

someStruct = testStruct

// Declare a resource named `TestResource`

resource TestResource {}

// Declare a variable that has the type `AnyResource`.
// Any resource-typed value can be assigned to it,
// but not non-resource typed values.
//
var someResource: @AnyResource <- create TestResource()

// Invalid: Resource-typed values can not be assigned
// to `AnyStruct`-typed variables
//
someStruct <- create TestResource()

// Invalid: Non-resource typed values can not be assigned
// to `AnyResource`-typed variables
//
someResource = 1
```

However, using `AnyStruct` and `AnyResource` does not allow you to opt out of type checking. It is invalid to access fields and call functions on these types, as they have no fields and functions.

```cadence
// Declare a variable that has the type `AnyStruct`.
// The initial value is an integer,
// but the variable still has the explicit type `AnyStruct`.
//
let a: AnyStruct = 1

// Invalid: Operator cannot be used for an `AnyStruct` value (`a`, left-hand side)
// and an `Int` value (`2`, right-hand side).
//
a + 2
```

`AnyStruct` and `AnyResource` may be used like other types. For example, they may be the element type of [arrays] or be the element type of an [optional type].

```cadence
// Declare a variable that has the type `[AnyStruct]`,
// i.e. an array of elements of any non-resource type.
//
let anyValues: [AnyStruct] = [1, "2", true]

// Declare a variable that has the type `AnyStruct?`,
// i.e. an optional type of any non-resource type.
//
var maybeSomething: AnyStruct? = 42

maybeSomething = "twenty-four"

maybeSomething = nil
```

`AnyStruct` is also the super-type of all non-resource optional types, and `AnyResource` is the super-type of all resource optional types.

```cadence
let maybeInt: Int? = 1
let anything: AnyStruct = maybeInt
```

[Conditional downcasting] allows coercing a value that has the type `AnyStruct` or `AnyResource` back to its original type.

## Optionals

Optionals are values which can represent the absence of a value. Optionals have two cases: either there is a value or there is nothing.

An optional type is declared using the `?` suffix for another type. For example, `Int` is a non-optional integer  and `Int?` is an optional integer (i.e., either nothing  or an integer).

The value representing nothing is `nil`.

```cadence
// Declare a constant which has an optional integer type,
// with nil as its initial value.
//
let a: Int? = nil

// Declare a constant which has an optional integer type,
// with 42 as its initial value.
//
let b: Int? = 42

// Invalid: `b` has type `Int?`, which does not support arithmetic.
b + 23

// Invalid: Declare a constant with a non-optional integer type `Int`,
// but the initial value is `nil`, which in this context has type `Int?`.
//
let x: Int = nil
```

Optionals can be created for any value, not just for literals.

```cadence
// Declare a constant which has a non-optional integer type,
// with 1 as its initial value.
//
let x = 1

// Declare a constant which has an optional integer type.
// An optional with the value of `x` is created.
//
let y: Int? = x

// Declare a variable which has an optional any type, i.e. the variable
// may be `nil`, or any other value.
// An optional with the value of `x` is created.
//
var z: AnyStruct? = x
```

A non-optional type is a subtype of its optional type.

```cadence
var a: Int? = nil
let b = 2
a = b

// `a` is `2`
```

Optional types may be contained in other types (e.g., [arrays] or even optionals.)

```cadence
// Declare a constant which has an array type of optional integers.
let xs: [Int?] = [1, nil, 2, nil]

// Declare a constant which has a double optional type.
//
let doubleOptional: Int?? = nil
```

See the [optional operators] section for information on how to work with optionals.

## Never

`Never` is the bottom type (i.e., it is a subtype of all types). There is no value that has type `Never`. 

`Never` can be used as the return type for functions that never return normally. For example, it is the return type of the function [`panic`].

```cadence
// Declare a function named `crashAndBurn` which will never return,
// because it calls the function named `panic`, which never returns.
//
fun crashAndBurn(): Never {
    panic("An unrecoverable error occurred")
}

// Invalid: Declare a constant with a `Never` type, but the initial value is an integer.
//
let x: Never = 1

// Invalid: Declare a function which returns an invalid return value `nil`,
// which is not a value of type `Never`.
//
fun returnNever(): Never {
    return nil
}
```

<!-- Relative links. Will not render on the page -->

[optional type]: ./anystruct-anyresource-opts-never.md#optionals
[arrays]: ./arrays.md
[Conditional downcasting]: ../operators.md#conditional-downcasting-operator-as
[optional operators]: ../operators.md#optional-operators
[`panic`]: ../built-in-functions.mdx#panic