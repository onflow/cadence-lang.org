---
title: Transactions
sidebar_position: 24
---

Transactions are objects that are signed with keys of one or more [accounts](./accounts/index.mdx)
and are sent to the chain to interact with it and perform state changes.

Transaction can [import](./imports.mdx) any number of types from any account using the import syntax.

```cadence
import FungibleToken from 0x01
```

A transaction is declared using the `transaction` keyword
and its contents are contained in curly braces.

The body of the transaction can declare local variables
that are valid throughout the whole of the transaction.

```cadence
transaction {
    // transaction contents
    let localVar: Int

    // ...
}
```

## Transaction parameters

Transactions can have parameters.
Transaction parameters are declared like function parameters.
The arguments for the transaction are passed along with the transaction.

Transaction parameters are accessible throughout the whole of the transaction.

```cadence
// Declare a transaction which has one parameter named `amount`
// that has the type `UFix64`
//
transaction(amount: UFix64) {

}
```

## Transaction phases

Transactions are executed in four phases:
preparation, pre-conditions, execution, and post-conditions, in that order.
The preparation and execution phases are blocks of code that execute sequentially.
The pre-conditions and post-condition are just like
[conditions in functions](./functions.mdx#function-preconditions-and-postconditions).

The following empty Cadence transaction has no logic,
but demonstrates the syntax for each phase, in the order these phases are executed:

```cadence
transaction {
    prepare(signer1: &Account, signer2: &Account) {
        // ...
    }

    pre {
        // ...
    }

    execute {
        // ...
    }

    post {
        // ...
    }
}
```

Although optional, each phase serves a specific purpose when executing a transaction
and it is recommended that developers use these phases when creating their transactions.

### Prepare phase

The `prepare` phase is used when the transaction needs access
to the accounts which signed (authorized) the transaction.

Access to the signing accounts is **only possible inside the `prepare` phase**.

For each signer of the transaction,
a [reference](./references.mdx) to the signing account is passed as an argument to the `prepare` phase.
The reference may be authorized, requesting certain [access to the account](./accounts/index.mdx#account-access).

For example, if the transaction has two signers,
the prepare **must** have two parameters of type `&Account`.

```cadence
prepare(signer1: &Account, signer2: &Account) {
    // ...
}
```

For instance, to request write access to an [account's storage](./accounts/storage.mdx),
the transaction can request an authorized reference:

```cadence
prepare(signer: auth(Storage) &Account) {
    // ...
}
```

As a best practice, only use the `prepare` phase to define and execute logic
that requires [write access](./accounts/index.mdx#performing-write-operations) to the signing accounts,
and *move all other logic elsewhere*.

Modifications to accounts can have significant implications,
so keep this phase clear of unrelated logic.
This ensures that users can easily read and understand the logic of the transaction
and how it affects their account.

The prepare phase serves a similar purpose as the
[initializer of a composite](https://developers.flow.com/next/cadence/language/composite-types#composite-type-fields).

For example, if a transaction performs a token transfer, put the withdrawal in the `prepare` phase,
as it requires access to the account storage, but perform the deposit in the `execute` phase.

### Pre-conditions

Transaction pre-conditions are just like
[pre-conditions of functions](./functions.mdx#function-preconditions-and-postconditions).

Pre-conditions are optional and are declared in a `pre` block.
They are executed after the `prepare` phase,
and are used for checking if explicit conditions hold before executing the remainder of the transaction.
The block can have zero or more conditions.

For example, a pre-condition might check the balance before transferring tokens between accounts.

```cadence
pre {
    sendingAccount.balance > 0
}
```

If any of the pre-conditions fail,
then the remainder of the transaction is not executed and it is completely reverted.

### Execute phase

The `execute` block executes the main logic of the transaction.
This phase is optional, but it is a best practice to add your main transaction logic in the section,
so it is explicit.

It is impossible to access the references to the transaction's signing accounts in the `execute` phase.

```cadence
transaction {
    prepare(signer: auth(LoadValue) &Account) {}

    execute {
        // Invalid: Cannot access the `signer` account reference, as it is not in scope
        let resource <- signer.storage.load<@Resource>(from: /storage/resource)
        destroy resource

        // Valid: Can obtain an unauthorized reference to any account
        let otherAccount = getAccount(0x3)
    }
}
```

### Post-conditions

Transaction post-conditions are just like
[post-conditions of functions](./functions.mdx#function-preconditions-and-postconditions).

Post-conditions are optional and are declared in a `post` block.
They are executed after the execution phase,
and are used to verify that the transaction logic has been executed properly.
The block can have zero or more conditions.

For example, a token transfer transaction can ensure that the final balance has a certain value:

```cadence
post {
    signer.balance == 30.0: "Balance after transaction is incorrect!"
}
```

If any of the post-conditions fail,
then the transaction fails and is completely reverted.

### Pre-conditions and post-conditions

Another function of the pre-conditions and post-conditions
is to describe the effects of a transaction on the involved accounts.
They are essential for users to verify what a transaction does before submitting it.
The conditions an easy way to introspect transactions before they are executed.

For example, the software that a user uses to sign and send a transaction
could analyze and interpret the transaction into a human-readable description, like
"This transaction will transfer 30 tokens from A to B.
The balance of A will decrease by 30 tokens and the balance of B will increase by 30 tokens."

## Summary

Transactions use phases to make the transaction's code / intent more readable.
They provide a way for developers to separate the transaction logic.
Transactions also provide a way to check the state prior / after transaction execution,
to prevent the transaction from running, or reverting changes made by the transaction if needed.

The following is a brief summary of how to use the `prepare`, `pre`, `execute`,
and `post` blocks in a transaction to implement the transaction's phases:

```cadence
transaction {
    prepare(signer1: &Account) {
        // Access signing accounts of the transaction.
        //
        // Avoid logic that does not need access to the signing accounts.
        //
        // The signing accounts can't be accessed anywhere else in the transaction.
    }

    pre {
        // Define conditions that must be true
        // for the transaction to execute.
        //
        // Define the expected state of things
        // as they should be before the transaction is executed.
    }

    execute {
        // The main transaction logic goes here, but you can access
        // any public information or resources published by any account.
    }

    post {
        // Define conditions that must be true
        // for the transaction to be committed.
        //
        // Define the expected state of things
        // as they should be after the transaction executed.
        //
        // Also used to provide information about what changes
        // the transaction will make to the signing accounts.
    }
}
```
