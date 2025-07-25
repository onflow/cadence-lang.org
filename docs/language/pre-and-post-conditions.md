---
title: Pre- and Post-Conditions
sidebar_position: 7
---

Pre-conditions and post-conditions are a unique and powerful feature of Cadence that allow you to specify conditions for execution that must be met for transactions and functions. If they're not met execution stops and the transaction is reverted. One use is to define specific inputs and outputs for a transaction that make it easy to see what will be transferred, regardless of how complex the transaction execution becomes. This property is particularly useful in using code written by an AI. To mock out an example:

> **Pre-condition**: The user has 50 Flow.

> **Execution**: Massively complex operation involving swaps between three different currencies, two dexes, and an NFT marketplace.

> **Post-condition**: The user has at least 30 Flow remaining, and owns SuperCoolCollection NFT #54.

## Function pre-conditions and post-conditions

Functions may have pre-conditions and may have post-conditions. They can be used to restrict the inputs (values for parameters) and output (return value) of a function.

Pre-conditions must be true right before the execution of the function. They are part of the function and introduced by the `pre` keyword, followed by the condition block.

Post-conditions must be true right after the execution of the function. Post-conditions are part of the function and introduced by the `post` keyword, followed by the condition block.

A conditions block consists of one or more conditions. Conditions are expressions evaluating to a boolean.

Conditions may be written on separate lines, or multiple conditions can be written on the same line, separated by a semicolon. This syntax follows the syntax for [statements].

Following each condition, an optional description can be provided after a colon. The condition description is used as an error message when the condition fails.

In post-conditions, the special constant `result` refers to the result of the function:

```cadence
fun factorial(_ n: Int): Int {
    pre {
        // Require the parameter `n` to be greater than or equal to zero.
        //
        n >= 0:
            "factorial is only defined for integers greater than or equal to zero"
    }
    post {
        // Ensure the result will be greater than or equal to 1.
        //
        result >= 1:
            "the result must be greater than or equal to 1"
    }

    if n < 1 {
       return 1
    }

    return n * factorial(n - 1)
}

factorial(5)  // is `120`

// Run-time error: The given argument does not satisfy
// the pre-condition `n >= 0` of the function, the program aborts.
//
factorial(-2)
```

In post-conditions, the special function `before` can be used to get the value of an expression just before the function is called:

```cadence
var n = 0

fun incrementN() {
    post {
        // Require the new value of `n` to be the old value of `n`, plus one.
        //
        n == before(n) + 1:
            "n must be incremented by 1"
    }

    n = n + 1
}
```

Both pre-conditions and post-conditions are considered [`view` contexts]; any operations that are not legal in functions with `view` annotations are also not allowed in conditions. In particular, this means that if you wish to call a function in a condition, that function must be `view`.

## Transaction Pre-conditions

Transaction pre-conditions function in the same way as [pre-conditions of functions].

Pre-conditions are optional and are declared in a `pre` block. They are executed after the `prepare` phase, and are used for checking if explicit conditions hold before executing the remainder of the transaction. The block can have zero or more conditions.

For example, a pre-condition might check the balance before transferring tokens between accounts:

```cadence
pre {
    sendingAccount.balance > 0
}
```

If any of the pre-conditions fail, then the remainder of the transaction is not executed and it is completely reverted.

## Transaction Post-conditions

Transaction post-conditions are just like [post-conditions of functions].

Post-conditions are optional and are declared in a `post` block. They are executed after the execution phase, and are used to verify that the transaction logic has been executed properly. The block can have zero or more conditions.

For example, a token transfer transaction can ensure that the final balance has a certain value:

```cadence
post {
    signer.balance == 30.0: "Balance after transaction is incorrect!"
}
```

If any of the post-conditions fail, then the transaction fails and is completely reverted.

## Pre- and post-conditions in interfaces

[Interfaces] can also define pre- and post-conditions. Please see the [interfaces] section for more details.

<!-- Relative links. Will not render on the page -->

[Interfaces]: ./interfaces.mdx
[pre-conditions of functions]: #function-pre-conditions-and-post-conditions
[post-conditions of functions]: #function-pre-conditions-and-post-conditions
[statements]: ./syntax.md#semicolons
[`view` contexts]: ./functions.mdx#view-functions
[Interfaces in types]: ./interfaces.mdx#interfaces-in-types
