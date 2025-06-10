---
title: Pre- and Post-Conditions
sidebar_position: 7
---

## Pre-conditions

Transaction pre-conditions are just like [pre-conditions of functions].

Pre-conditions are optional and are declared in a `pre` block. They are executed after the `prepare` phase, and are used for checking if explicit conditions hold before executing the remainder of the transaction. The block can have zero or more conditions.

For example, a pre-condition might check the balance before transferring tokens between accounts:

```cadence
pre {
    sendingAccount.balance > 0
}
```

If any of the pre-conditions fail, then the remainder of the transaction is not executed and it is completely reverted.

## Post-conditions

Transaction post-conditions are just like [post-conditions of functions].

Post-conditions are optional and are declared in a `post` block. They are executed after the execution phase, and are used to verify that the transaction logic has been executed properly. The block can have zero or more conditions.

For example, a token transfer transaction can ensure that the final balance has a certain value:

```cadence
post {
    signer.balance == 30.0: "Balance after transaction is incorrect!"
}
```

If any of the post-conditions fail, then the transaction fails and is completely reverted.

## Using pre-conditions and post-conditions

Another function of the pre-conditions and post-conditions is to describe the effects of a transaction on the involved accounts. They are essential for users to verify what a transaction does before submitting it. The conditions are an easy way to introspect transactions before they are executed.

For example, the software that a user uses to sign and send a transaction could analyze and interpret the transaction into a human-readable description, such as "This transaction will transfer 30 tokens from A to B. The balance of A will decrease by 30 tokens and the balance of B will increase by 30 tokens."

## Function pre-conditions and post-conditions

Functions may have pre-conditions and may have post-conditions. Pre-conditions and post-conditions can be used to restrict the inputs (values for parameters) and output (return value) of a function.

Pre-conditions must be true right before the execution of the function. Pre-conditions are part of the function and introduced by the `pre` keyword, followed by the condition block.

Post-conditions must be true right after the execution of the function. Post-conditions are part of the function and introduced by the `post` keyword, followed by the condition block. Post-conditions may only occur after pre-conditions, if any.

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

## Interface declaration

Interfaces are declared using the `struct`, `resource`, or `contract` keyword, followed by the `interface` keyword, the name of the interface, and the requirements, which must be enclosed in opening and closing braces.

Field requirements can be annotated to require the implementation to be a variable field, by using the `var` keyword; to require the implementation to be a constant field, use the `let` keyword; or, the field requirement may specify nothing, in which case the implementation may either be a variable or a constant field.

Field requirements and function requirements must specify the required level of access. The access must be at least public, so the `access(all)` keyword must be provided.

Interfaces can be used in types. This is explained in detail in the [Interfaces in types] section. For now, the syntax `{I}` can be read as the type of any value that implements the interface `I`:

```cadence
// Declare a resource interface for a fungible token.
// Only resources can implement this resource interface.
//
access(all)
resource interface FungibleToken {

    // Require the implementing type to provide a field for the balance
    // that is readable in all scopes (`access(all)`).
    //
    // Neither the `var` keyword, nor the `let` keyword is used,
    // so the field may be implemented as either a variable
    // or as a constant field.
    //
    access(all)
    balance: Int

    // Require the implementing type to provide an initializer that
    // given the initial balance, must initialize the balance field.
    //
    init(balance: Int) {
        pre {
            balance >= 0:
                "Balances are always non-negative"
        }
        post {
            self.balance == balance:
                "the balance must be initialized to the initial balance"
        }

        // NOTE: The declaration contains no implementation code.
    }

    // Require the implementing type to provide a function that is
    // callable in all scopes, which withdraws an amount from
    // this fungible token and returns the withdrawn amount as
    // a new fungible token.
    //
    // The given amount must be positive and the function implementation
    // must add the amount to the balance.
    //
    // The function must return a new fungible token.
    // The type `{FungibleToken}` is the type of any resource
    // that implements the resource interface `FungibleToken`.
    //
    access(all)
    fun withdraw(amount: Int): @{FungibleToken} {
        pre {
            amount > 0:
                "the amount must be positive"
            amount <= self.balance:
                "insufficient funds: the amount must be smaller or equal to the balance"
        }
        post {
            self.balance == before(self.balance) - amount:
                "the amount must be deducted from the balance"
        }

        // NOTE: The declaration contains no implementation code.
    }

    // Require the implementing type to provide a function that is
    // callable in all scopes, which deposits a fungible token
    // into this fungible token.
    //
    // No pre-condition is required to check the given token's balance
    // is positive, as this condition is already ensured by
    // the field requirement.
    //
    // The parameter type `{FungibleToken}` is the type of any resource
    // that implements the resource interface `FungibleToken`.
    //
    access(all)
    fun deposit(_ token: @{FungibleToken}) {
        post {
            self.balance == before(self.balance) + token.balance:
                "the amount must be added to the balance"
        }

        // NOTE: The declaration contains no implementation code.
    }
}
```

:::info

The required initializer and functions do not have any executable code.

:::

Struct and resource interfaces can only be declared directly inside contracts (i.e., not inside of functions). Contract interfaces can only be declared globally and not inside contracts.

See [Interfaces] for more information.

<!-- Relative links. Will not render on the page -->

[Interfaces]: ./interfaces.mdx
[pre-conditions of functions]: #function-pre-conditions-and-post-conditions
[post-conditions of functions]: #function-pre-conditions-and-post-conditions
[statements]: ./syntax.md#semicolons
[`view` contexts]: ./functions.mdx#view-functions
[Interfaces in types]: ./interfaces.mdx#interfaces-in-types