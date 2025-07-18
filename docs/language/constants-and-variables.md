---
title: Constants and Variable Declarations
sidebar_position: 2
---

Constants and variables are declarations that bind a value and [type] to an identifier. Constants are initialized with a value and cannot be reassigned afterwards. Variables are initialized with a value and can be reassigned later. Declarations can be created in any scope, including the global scope.

Constant means that the _identifier's_ association is constant, not the _value_ itself — the value may still be changed if it is mutable.  For example, you can change the values inside of a constant array, but you cannot replace the array assignment with a new array.

Constants are declared using the `let` keyword. Variables are declared using the `var` keyword. The keywords are followed by the identifier, an optional [type annotation], an equals sign `=`, and the initial value:

```cadence
// Declare a constant named `a`.
//
let a = 1

// Invalid: re-assigning to a constant.
//
a = 2

// Declare a variable named `b`.
//
var b = 3

// Assign a new value to the variable named `b`.
//
b = 4
```

Variables and constants **must** be initialized:

```cadence
// Invalid: the constant has no initial value.
//
let a
```

The names of the variable or constant declarations in each scope must be unique. Declaring another variable or constant with a name that is already declared in the current scope is invalid, regardless of kind or type:

```cadence
// Declare a constant named `a`.
//
let a = 1

// Invalid: cannot re-declare a constant with name `a`,
// as it is already used in this scope.
//
let a = 2

// Declare a variable named `b`.
//
var b = 3

// Invalid: cannot re-declare a variable with name `b`,
// as it is already used in this scope.
//
var b = 4

// Invalid: cannot declare a variable with the name `a`,
// as it is already used in this scope,
// and it is declared as a constant.
//
var a = 5
```

However, variables can be redeclared in sub-scopes:

```cadence
// Declare a constant named `a`.
//
let a = 1

if true {
    // Declare a constant with the same name `a`.
    // This is valid because it is in a sub-scope.
    // This variable is not visible to the outer scope.

    let a = 2
}

// `a` is `1`
```

A variable cannot be used as its own initial value:

```cadence
// Invalid: Use of variable in its own initial value.
let a = a
```

<!-- Relative links. Will not render on the page -->

[type]: ./types-and-type-system/type-safety.md
[type annotation]: ./types-and-type-system/type-annotations.md