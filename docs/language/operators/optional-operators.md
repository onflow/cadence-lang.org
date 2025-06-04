---
title: Optional Operators
sidebar_position: 6
---

## Nil-coalescing operator (`??`)

The nil-coalescing operator `??` returns the value inside an optional if it contains a value, or returns an alternative value if the optional has no value (i.e., the optional value is `nil`).

If the left-hand side is non-nil, the right-hand side is not evaluated:

```cadence
// Declare a constant which has an optional integer type
//
let a: Int? = nil

// Declare a constant with a non-optional integer type,
// which is initialized to `a` if it is non-nil, or 42 otherwise.
//
let b: Int = a ?? 42
// `b` is 42, as `a` is nil
```

The nil-coalescing operator can only be applied to values that have an optional type:

```cadence
// Declare a constant with a non-optional integer type.
//
let a = 1

// Invalid: nil-coalescing operator is applied to a value which has a non-optional type
// (a has the non-optional type `Int`).
//
let b = a ?? 2
```

```cadence
// Invalid: nil-coalescing operator is applied to a value which has a non-optional type
// (the integer literal is of type `Int`).
//
let c = 1 ?? 2
```

The type of the right-hand side of the operator (the alternative value) must be a subtype of the type of left-hand side. This means that the right-hand side of the operator must be the non-optional or optional type matching the type of the left-hand side:

```cadence
// Declare a constant with an optional integer type.
//
let a: Int? = nil
let b: Int? = 1
let c = a ?? b
// `c` is `1` and has type `Int?`

// Invalid: nil-coalescing operator is applied to a value of type `Int?`,
// but the alternative has type `Bool`.
//
let d = a ?? false
```

## Force unwrap operator (`!`)

The force-unwrap operator (`!`) returns the value inside an optional if it contains a value, or panics and aborts the execution if the optional has no value (i.e., the optional value is `nil`):

```cadence
// Declare a constant which has an optional integer type
//
let a: Int? = nil

// Declare a constant with a non-optional integer type,
// which is initialized to `a` if `a` is non-nil.
// If `a` is nil, the program aborts.
//
let b: Int = a!
// The program aborts because `a` is nil.

// Declare another optional integer constant
let c: Int? = 3

// Declare a non-optional integer
// which is initialized to `c` if `c` is non-nil.
// If `c` is nil, the program aborts.
let d: Int = c!
// `d` is initialized to 3 because c isn't nil.

```

The force-unwrap operator can only be applied to values that have an optional type:

```cadence
// Declare a constant with a non-optional integer type.
//
let a = 1

// Invalid: force-unwrap operator is applied to a value which has a
// non-optional type (`a` has the non-optional type `Int`).
//
let b = a!
```

```cadence
// Invalid: The force-unwrap operator is applied
// to a value which has a non-optional type
// (the integer literal is of type `Int`).
//
let c = 1!
```

<!-- Relative links. Will not render on the page -->

