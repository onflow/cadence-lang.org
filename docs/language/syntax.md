---
title: Syntax
sidebar_position: 1
---

## Comments

Comments can be used to document code.
A comment is text that is not executed.

*Single-line comments* start with two slashes (`//`).
These comments can go on a line by themselves or they can go directly after a line of code.

```cadence
// This is a comment on a single line.
// Another comment line that is not executed.

let x = 1  // Here is another comment after a line of code.
```

*Multi-line comments* start with a slash and an asterisk (`/*`)
and end with an asterisk and a slash (`*/`):

```cadence
/* This is a comment which
spans multiple lines. */
```

Comments may be nested.

```cadence
/* /* this */ is a valid comment */
```

Multi-line comments are balanced.

```cadence
/* this is a // comment up to here */ this is not part of the comment */
```

### Documentation Comments
Documentation comments (also known as "doc-strings" or "doc-comment") are a special set of comments that can be
processed by tools, for example to generate human-readable documentation, or provide documentation in an IDE.

Doc-comments either start with three slashes (`///`) on each line,
or are surrounded by `/**` and `**/`.

```cadence
/// This is a documentation comment for `x`.
/// It spans multiple lines.

let x = 1
```

```cadence
/**
  This is a documentation comment
  which also spans multiple lines.
**/
```

## Identifiers

Identifiers may start with any upper or lowercase letter (A-Z, a-z)
or an underscore (`_`).
This may be followed by zero or more upper and lower case letters,
underscores, and numbers (0-9).
Identifiers may not begin with a number.

```cadence
// Valid: title-case
//
PersonID

// Valid: with underscore
//
token_name

// Valid: leading underscore and characters
//
_balance

// Valid: leading underscore and numbers
_8264

// Valid: characters and number
//
account2

// Invalid: leading number
//
1something

// Invalid: invalid character #
_#1

// Invalid: various invalid characters
//
!@#$%^&*
```

### Reserved identifiers

The following identifiers are reserved, as they are keywords of the language:

- `if`, `else`, `while`, `for`, `in`, `as`
- `break`, `continue`, `return`
- `true`, `false`, `nil`
- `let`, `var`
- `create`, `destroy`, `emit`
- `fun`, `pre`, `post`,
- `auth`, `access`
- `self`, `init`
- `contract`, `event`, `struct`, `resource`, `interface`,
  `entitlement`, `enum`, `mapping`, `attachment`, `result`
- `transaction`, `prepare`, `execute`
- `switch`, `case`, `default`
- `import`, `include`
- `require`, `requires`, `static`, `native`, `pub`, `priv`, `try`, `catch`, `finally`,
  `goto`, `const`, `export`, `throw`, `throws`, `where`, `final`, `internal`, `typealias`,
  `repeat`, `guard`, `is`

### Conventions

By convention, variables, constants, and functions have lowercase identifiers;
and types have title-case identifiers.

## Semicolons

Semicolons (;) are used as separators between declarations and statements.
A semicolon can be placed after any declaration and statement,
but can be omitted between declarations and if only one statement appears on the line.

Semicolons must be used to separate multiple statements if they appear on the same line.

```cadence
// Declare a constant, without a semicolon.
//
let a = 1

// Declare a variable, with a semicolon.
//
var b = 2;

// Declare a constant and a variable on a single line, separated by semicolons.
//
let d = 1; var e = 2
```
