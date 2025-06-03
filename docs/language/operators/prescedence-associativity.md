---
title: Prescedence and Associativity
sidebar_position: 7
---

Operators have the following precedences, from highest to lowest:

- Unary precedence: `-`, `!`, `<-`
- Cast precedence: `as`, `as?`, `as!`
- Multiplication precedence: `*`, `/`, `%`
- Addition precedence: `+`, `-`
- Bitwise shift precedence: `<<`, `>>`
- Bitwise conjunction precedence: `&`
- Bitwise exclusive disjunction precedence: `^`
- Bitwise disjunction precedence: `|`
- Nil-coalescing precedence: `??`
- Relational precedence: `<`, `<=`, `>`, `>=`
- Equality precedence: `==`, `!=`
- Logical conjunction precedence: `&&`
- Logical disjunction precedence: `||`
- Ternary precedence: `? :`

All operators are left-associative, except for the following operators, which are right-associative:

- Ternary operator
- Nil-coalescing operator

Expressions can be wrapped in parentheses to override precedence conventions (i.e., an alternate order should be indicated), or when the default order should be emphasized (e.g., to avoid confusion). For example, `(2 + 3) * 4` forces addition to precede multiplication, and `5 + (6 * 7)` reinforces the default order.

<!-- Relative links. Will not render on the page -->

[resource types]: ../resources.mdx
[logical shifting]: https://en.wikipedia.org/wiki/Logical_shift
[arithmetic shifting]: https://en.wikipedia.org/wiki/Arithmetic_shift
[conditional downcasting operator `as?`]: ./casting-operators.md#conditional-downcasting-operator-as