---
archived: false
draft: false
title: 2. Hello World
description: A smart contract tutorial for Cadence.
date: 2024-09-17
meta:
  keywords:
    - tutorial
    - Flow
    - Cadence
    - Hello World
tags:
  - reference
  - cadence
  - tutorial
socialImageTitle: Hello World
socialImageDescription: Hello world smart contract image.
---

In this tutorial, we'll write and deploy our first smart contract!  

After completing this tutorial, you'll be able to:

* Declare a public Cadence smart contract.
* Initialize a public `String` variable. 
* Write simple transactions in Cadence.
* Describe the role of signers in a Cadence transaction.

## Overview

It's time to write your own "Hello World" contract.  In this instance, the contract will:

1. Create and initialize a smart contract with a single field of type `String`
2. Initialize the field with the phrase "Hello, World!"
3. Create a function in the contract that returns our greeting

We will deploy this contract in an account, use a transaction to interact with the contract, and finally, explore the role of signers in a transaction.

## Implementing Hello World

:::info[Action]

If you haven't already, you'll need to follow this link to open a playground session with the Hello World contracts, transactions, and scripts pre-loaded:

{' '}
<a
  href="https://play.flow.com/483b2f33-9e71-40aa-924a-2c5f0ead77aa"
  target="_blank"
>
  https://play.flow.com/483b2f33-9e71-40aa-924a-2c5f0ead77aa
</a>

:::

It's empty!

:::info[Action]

Begin by declaring your contract.

:::

```cadence
access(all) contract HelloWorld {
  // Todo
}
```

### Declare a Contract-Level Constant

The line `access(all) contract HelloWorld ` declares a contract with [Access Control] that is accessible in all scopes - or public.

:::info[Action]

Add a public constant `String` field to store your greeting.  

:::

```cadence
// Incomplete code example
// An error is expected here, see below

// Declare a public (access(all)) field of type String.
access(all) let greeting: String
```

:::warning

Cadence follows the pattern of Swift where the `let` keyword is used to declare a constant. The `var` keyword is used to declare a variable.

:::

As before, you're using the `access` keyword to set the scope to `all` and make the constant public.  The `let` keyword declares a state constant named `greeting`, and the [type annotation] declares it as a `String`.

You've probably noticed the error that your code is `` missing initializer for field `greeting` in type `HelloWorld` ``

[Composite Types], which includes contracts, have a special initializer function that is run exactly once, upon object creation.  It's optional, but constants declared at the contract level must have a value set in the initializer.

:::info[Action]

Add an initializer and initialize your `greeting`.

:::

```cadence
// The initializer is required if the contract contains any fields.
init() {
  self.greeting = "Hello, World!"
}
```

### Add a View Function

You've created a contract and initialized the `"Hello, World!"` `String`.  The next step is to:

:::info[Action]

Implement a `view` function to return the `greeting` constant.

:::

```cadence
// Public function that returns our friendly greeting!
access(all) view fun hello(): String {
    return self.greeting
}
```

Once again, the access level is public.  Anyone who imports this contract into their own contract, transaction, or script can read the public fields, use the public types, and call the public contract functions - the ones that have `access(all)` specified.

The `view` annotation indicates that the function is permitted to view, but not modify blockchain state.

## Accounts

Each user has an account controlled by one or more private keys with configurable weight. This means that support for accounts/wallets with [multiple controllers] is built into the protocol by default.

An account is divided into two main areas:

### Contract Area

The first area is the [contract area].

This is the area that stores smart contracts containing type definitions, fields, and functions that relate to common functionality. There is no limit to the number of smart contracts an account can store.

The information in the contract area cannot be directly accessed in a transaction unless the transaction is just returning (reading) a copy of the code deployed to an account.

The owner of an account can directly add or update contracts that are deployed to it.

:::warning[Important]

On Flow Cadence, **smart contracts are upgradeable**.  If you make a mistake, you can fix it in a public and transparent manner.

:::

The second area is where you'll find [account storage](../language/accounts/storage).  This area is where an account stores the objects that they own. This is an important differentiator between Cadence and other languages, because in other languages, assets that accounts own are usually stored in the centralized smart contract that defines the assets. 

:::warning[Important]

In Cadence, **each account stores its assets as objects directly in its own account storage**.

:::

The account storage section also stores code that declares the capabilities for controlling how these stored objects can be accessed. We'll cover account storage and capabilities in more detail in a later tutorial.

In this tutorial, we'll use the account with the address `0x06` to store our `HelloWorld` contract.

### Deploying the HelloWorld Contract

:::info[Action]

Make sure that the account `0x06` tab is selected and that the
`HelloWorld.cdc` file is in the editor.

Click the deploy button to deploy the contents of the editor to account `0x06`.

:::

![Deploy Contract](deploybox.png)

You should see a log in the output area indicating that the deployment succeeded.

```text
Deployed Contract To: 0x06
```

You'll also see the name of the contract in the selected account tab underneath the number for the account. This indicates that the `HelloWorld` contract has been deployed to the account.

You can always look at this tab to verify which contracts are in which accounts.

## Transactions

A [Transaction] in Flow is defined as an arbitrary-sized block of Cadence code that is authorized by one or more accounts.

When an account authorizes a transaction, the code in that transaction has access to the authorizers' private storage.

An account authorizes a transaction by performing a cryptographic signature on the transaction with the account's private key, which should only be accessible to the account owner.

In addition to being able to access the authorizer's private assets, transactions can also read and call functions in public contracts, and access public functions in other users' accounts.

For this tutorial, we'll use a transaction to call our `hello()` function.

:::info[Action]

Click the `+` button by the `Transactions` folder to create a new transaction file.  Name it `CallHello.cdc`.

:::

First, you'll need to import the **deployed instance** of `HelloWorld` from account `0x06`. If you haven't deployed the smart contract from the account, the transaction won't have access to it and the import will fail.

:::info[Action]

Add an `import` at the top of the file.

:::

```cadence
import HelloWorld from 0x06
```

This imports the entire contract code from `HelloWorld`, including type definitions and public functions, so that the transaction can use them to interact with the `HelloWorld` contract in account `0x06`.

To import any smart contract from any account, you can use this format:

```cadence
// Replace {ContractName} with the name of the contract you want to import
// and {Address} with the account you want to import it from
import {ContractName} from {Address}
```

Transactions are written in Cadence and are declared with the `transaction` keyword.

:::info[Action]

Declare an empty `transaction`.

:::

```cadence
transaction {
  // TODO
}
```

### Transaction Process

Transactions are divided into two main phases, `prepare` and `execute`.

The [`prepare`] phase is required and is used to identify the account(s) that will sign the transaction.  It's also used when the transaction needs to access the account(s) that signed the transaction. The latter is not needed for this simple transaction.

:::info[Action]

Add an empty `prepare` statement to your transaction.

:::

```cadence
prepare(acct: &Account) {
  // Nothing is needed here for now
}
```

The `execute` phase is the main body of a transaction. It can call functions on external contracts and objects and perform operations on data that was initialized in the transaction.

:::info[Action]

Add an `execute` block to your transaction and use it to `log` the output of the `hello()` function from the imported `HelloWorld` contract to the console.

:::

```cadence
execute {
  log(HelloWorld.hello())
}
```

In this example, the `execute` phase calls `HelloWorld.hello()`. This executes the `hello()` function in the `HelloWorld` contract
and logs the result(`log(HelloWorld.hello())`) to the console.

:::info[Action]

In the box at the bottom right of the editor, select Account `0x06` as the transaction signer.

Click the `Send` button to submit the transaction

:::

You should see something like this in the transaction results at the bottom of the screen:

```text
16:46:56
Simple Transaction
[1]
Cadence log: "Hello, World!"
```

Congratulations, you just executed your first Cadence transaction with the account `0x06` as the signer.

In this tutorial, you'll get the same result if you use different signers for the transaction but later tutorials will use more complex examples that have different results depending on the signer.

## Conclusion

This tutorial covered an introduction to Cadence, including terms like accounts, transactions, and signers. We implemented a smart contract that is accessible in all scopes. The smart contract had a `String` field initialized with the value `Hello, World!` and a function to return (read) this value.

Next, we deployed this contract in an account and implemented a transaction to call the function in the smart contract and log the result to the console. Finally, we used the account `0x06` as the signer for this transaction.

Feel free to modify the smart contract to implement different functions,
experiment with the available [Cadence types], and write new transactions that execute multiple functions from your `HelloWorld` smart contract.

<!-- Relative links.  Will not render on the page -->

[Cadence]: ../index.md
[Access Control]: ../language/access-control.md
[variable]: ../language/constants-and-variables.md
[type annotation]: ../language/type-annotations.md
[Composite Types]: ../language/composite-types.mdx
[multiple controllers]: https://www.coindesk.com/what-is-a-multisignature-crypto-wallet
[contract area]: ../language/accounts/contracts
[account storage]: ../language/accounts/storage
[Transaction]: ../language/transactions.md
[`prepare`]: ../language/transactions.md#prepare-phase
[Cadence types]: ../language/values-and-types.mdx
