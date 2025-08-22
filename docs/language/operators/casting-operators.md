---
title: Casting Operators
sidebar_position: 5
---

## Static casting operator (`as`)

The static casting operator `as` can be used to statically type cast a value to a type.

If the static type of the value is a subtype of the given type (the _target_ type), the operator returns the value as the given type.

The cast is performed statically (i.e., when the program is type-checked). Only the static type of the value is considered — not the run-time type of the value.

This means it is not possible to downcast using this operator. Consider using the [conditional downcasting operator `as?`] instead.

```cadence
// Declare a constant named `integer` which has type `Int`.
//
let integer: Int = 1

// Statically cast the value of `integer` to the supertype `Number`.
// The cast succeeds, because the type of the variable `integer`,
// the type `Int`, is a subtype of type `Number`.
// This is an upcast.
//
let number = integer as Number
// `number` is `1` and has type `Number`

// Declare a constant named `something` which has type `AnyStruct`,
// with an initial value which has type `Int`.
//
let something: AnyStruct = 1

// Statically cast the value of `something` to `Int`.
// This is invalid, the cast fails, because the static type of the value is type `AnyStruct`,
// which is not a subtype of type `Int`.
//
let result = something as Int
```

## Conditional downcasting operator (`as?`)

The conditional downcasting operator `as?` can be used to dynamically type cast a value to a type. The operator returns an optional. If the value has a run-time type that is a subtype of the target type the operator returns the value as the target type; otherwise, the result is `nil`.

The cast is performed at run-time (when the program is executed) and not statically (when the program is checked).

```cadence
// Declare a constant named `something` which has type `AnyStruct`,
// with an initial value which has type `Int`.
//
let something: AnyStruct = 1

// Conditionally downcast the value of `something` to `Int`.
// The cast succeeds, because the value has type `Int`.
//
let number = something as? Int
// `number` is `1` and has type `Int?`

// Conditionally downcast the value of `something` to `Bool`.
// The cast fails, because the value has type `Int`,
// and `Bool` is not a subtype of `Int`.
//
let boolean = something as? Bool
// `boolean` is `nil` and has type `Bool?`
```

Downcasting works for concrete types, but also works for nested types (e.g., arrays), interfaces, optionals, and so on.

```cadence
// Declare a constant named `values` which has type `[AnyStruct]`,
// i.e. an array of arbitrarily typed values.
//
let values: [AnyStruct] = [1, true]

let first = values[0] as? Int
// `first` is `1` and has type `Int?`

let second = values[1] as? Bool
// `second` is `true` and has type `Bool?`
```

## Force-downcasting operator (`as!`)

The force-downcasting operator `as!` behaves like the [conditional downcasting operator `as?`]. However, if the cast succeeds, it returns a value of the given type instead of an optional; if the cast fails, it aborts the program instead of returning `nil`:

```cadence
// Declare a constant named `something` which has type `AnyStruct`,
// with an initial value which has type `Int`.
//
let something: AnyStruct = 1

// Force-downcast the value of `something` to `Int`.
// The cast succeeds, because the value has type `Int`.
//
let number = something as! Int
// `number` is `1` and has type `Int`

// Force-downcast the value of `something` to `Bool`.
// The cast fails, because the value has type `Int`,
// and `Bool` is not a subtype of `Int`.
//
let boolean = something as! Bool
// Run-time error
```

## Implicit casting

Cadence does not allow implicit casting (coercion). 

```cadence
let value: UInt8 = 1

// invalid: implicit cast
let intValue: Int = value
```

Instead, conversion must be explicitly performed by calling a conversion function.
Cadence provides a conversion function for each number type. The functions have the same name as the type, accept any number, and return the number type. 
If the value cannot be converted, the function panics.

For example, for the type `Int`, the conversion function `fun Int(_ number: Number): Int` is provided.

For example, to convert a `UInt8` value to an `Int` value:

```cadence
let value: UInt8 = 1 
let intValue = Int(value)

<!-- Relative links. Will not render on the page -->

[conditional downcasting operator `as?`]: #conditional-downcasting-operator-as