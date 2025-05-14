---
archived: false
draft: false
title: Hello World
description: A smart contract tutorial for Cadence.
date: 2024-11-26
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
socialImageDescription: Write your own Hello World smart contract in Cadence.
---

It's time to write your own "Hello World" contract. In this instance, the contract accomplishes the following:

1. Create and initialize a smart contract with a single field of type `String`.
1. Initialize the field with the phrase "Hello, World!".
1. Create a function in the contract that returns our greeting.

We will deploy this contract in an account, use a transaction to interact with the contract, and finally, explore the role of signers in a transaction.

## Objectives

After completing this tutorial, you'll be able to:

- Declare a public Cadence smart contract.
- Initialize a public `String` variable.
- Write simple transactions and scripts in Cadence.
- Describe the role of signers in a Cadence transaction.

## How to implement Hello World

Open the starter code for this tutorial in the Flow Playground, which is empty: [play.flow.com/e559739d-603e-40d5-b2f1-b9957051cdc4].

Declare your contract by entering the following:

```cadence
access(all) contract HelloWorld {
  // Todo
}
```

### Declaring a Contract-Level Constant

The line `access(all) contract HelloWorld ` declares a contract with [Access Control] that is accessible in all scopes, including public.

Add a public constant `String` field to store your greeting:

```cadence
// Incomplete code example
// An error is expected here, see below

// Declare a public (access(all)) field of type String.
access(all) let greeting: String
```

:::warning

Cadence follows the same pattern as Swift where the `let` keyword is used to declare a constant. The `var` keyword is used to declare a variable.

:::

As before, you're using the `access` keyword to set the scope to `all` and make the constant public. The `let` keyword declares a state constant named `greeting`, and the [type annotation] declares it as a `String`.

You'll probably notice the following error in your code:

```text
missing initializer for field `greeting` in type `HelloWorld`
```

[Composite Types], which includes contracts, have a special initializer function that is run exactly once, upon object creation. It's optional, but constants declared at the contract level must have a value set in the initializer.

Add the following initializer and initialize your `greeting`:

```cadence
// The initializer is required if the contract contains any fields.
init() {
  self.greeting = "Hello, World!"
}
```

### Adding a View Function

After you create a contract and initialized the `"Hello, World!"` `String`, the next step is to implement a `view` function to return the `greeting` constant:

```cadence
// Public function that returns our friendly greeting!
access(all) view fun hello(): String {
    return self.greeting
}
```

Once again, the access level is public. Anyone who imports this contract into their own contract, transaction, or script can read the public fields, use the public types, and call the public contract functions — the ones that have `access(all)` specified.

The `view` annotation indicates that the function is permitted to view, but not modify blockchain state.

## Accounts

Each user has an account controlled by one or more private keys with configurable weight. This means that support for accounts/wallets with [multiple controllers] is built into the protocol by default.

An account is divided into several areas:

- _Contracts_
- _Account Storage_
- _Capabilities_
- _Keys_

### Contract Area

The first area is the [contract area], or `account.contracts`.

This is the area that stores smart contracts deployed to the account. These contracts contain type definitions, fields, and functions that relate to common functionality. There is no limit to the number of smart contracts an account can store.

:::tip

Much of the functionality that you'd find in a Solidity smart contract is instead written in [transactions] or scripts for Cadence apps. These exist outside the smart contract, which means you don't need to anticipate absolutely everything you might want to do or view before deploying the contract.

:::

The information in the contract area cannot be directly accessed in a transaction unless the transaction imports the contract or returns (reads) a copy of the code deployed to an account.

The owner of an account can directly add or update contracts that are deployed to it.

:::warning[Important]

On Flow Cadence, **smart contracts _are_ upgradeable**. If you make a mistake, you can often [update] it, constrained by some rules, in a public and transparent manner.

:::

### Account Storage

The second area is where you'll find [account storage], or `account.storage`. This area is where an account stores the objects that it owns. This is an important differentiator between Cadence and other languages, because in other languages, assets that accounts own are usually stored in the centralized smart contract ledger that defines the assets.

:::warning[Important]

In Cadence, each account **stores its assets as objects directly in its own account storage**, similar to how you store your own possessions in your own house in real life!

:::

The account storage section also stores code that declares the capabilities for controlling how these stored objects can be accessed. We'll cover account storage and capabilities in more detail in a later tutorial.

In this tutorial, we'll use the account with the address `0x06` to store our `HelloWorld` contract.

### Capabilities

[Capabilities], or `account.capabilities`, are a part of the security model in Cadence. They represent the right to access parts of or all of an object and perform operations on it. For example, a user might possess a vault that holds fungible tokens. In this case, they'll have the capability that allows anyone to deposit tokens into the vault, and may choose to grant the capability to withdraw tokens to their broker's account.

### Keys

[Keys], or `account.keys`, are used to sign [transactions]. In Cadence, an account can have many keys. These keys can be shared or revoked, providing native version of [account abstraction] that is extremely powerful. For example, you can use it to [build an app] that pulls NFTs in an embedded wallet in one app into that user's browser wallet and then use them in your app.

## Deploying the HelloWorld Contract

To deploy a contract, make sure that the account `0x06` tab is selected and that the `HelloWorld.cdc` file is in the editor. Then, click the `Deploy` button to deploy the contents of the editor to account `0x06`:

![Deploy Contract](deploybox.png)

You should see a log in the output area indicating that the deployment succeeded:

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

### Importing a transaction

This tutorial uses a transaction to call our `hello()` function:

1. Open the `CallHello` file in the `Transactions` folder.
2. Import the **deployed instance** of `HelloWorld` from account `0x06`. If you haven't deployed the smart contract from the account, the transaction won't have access to it and the import will fail.
3. Add an `import` at the top of the file:
   ```cadence
   import HelloWorld from 0x06
   ```
   This imports the entire contract code from `HelloWorld`, including type definitions and public functions, so that the transaction can use them to interact with the `HelloWorld` contract in account `0x06`.
4. To import any smart contract from any account, use this format:
   ```cadence
   // Replace {ContractName} with the name of the contract you want to import
   // and {Address} with the account you want to import it from
   import {ContractName} from {Address}
   ```
   Transactions are written in Cadence and are declared with the `transaction` keyword.
5. Declare an empty `transaction`:
   ```cadence
   transaction {
     // TODO
   }
   ```

### Working with a Transaction Process

Transactions are divided into two main phases, `prepare` and `execute`.

The [`prepare`] phase is required and is used to identify the account(s) that will sign the transaction. It's also used when the transaction needs to access the account(s) that signed the transaction. The latter is not needed for this simple transaction.

1. Add an empty `prepare` statement to your transaction:
   ```cadence
   prepare(acct: &Account) {
     // Nothing is needed here for now
   }
   ```
   The `execute` phase is the main body of a transaction. It can call functions on external contracts and objects and perform operations on data that was initialized in the transaction.
2. Add an `execute` block to your transaction and use it to `log` the output of the `hello()` function from the imported `HelloWorld` contract to the console:
   ```cadence
   execute {
     log(HelloWorld.hello())
   }
   ```
   In this example, the `execute` phase calls `HelloWorld.hello()`. This executes the `hello()` function in the `HelloWorld` contract and logs the result(`log(HelloWorld.hello())`) to the console.
3. In the box at the bottom right of the editor, select Account `0x06` as the transaction signer.
4. Click the `Send` button to submit the transaction
   You should see something similar to the following in the transaction results at the bottom of the screen:
   ```text
   16:46:56
   Simple Transaction
   [1]
   Cadence log: "Hello, World!"
   ```

Congratulations, you just executed your first Cadence transaction with the account `0x06` as the signer!

This tutorial shows you the same result if you use different signers for the transaction but later tutorials will use more complex examples that have different results, depending on the signer.

## Conclusion

This tutorial covered an introduction to Cadence, including terms such as accounts, transactions, and signers. We implemented a smart contract that is accessible in all scopes. The smart contract had a `String` field initialized with the value `Hello, World!` and a function to return (read) this value.

Next, we deployed this contract in an account and implemented a transaction to call the function in the smart contract and log the result to the console. Finally, we used the account `0x06` as the signer for this transaction.

Now that you have completed the tutorial, you can:

- Declare a public Cadence smart contract.
- Initialize a public `String` variable.
- Write simple transactions in Cadence.
- Describe the role of signers in a Cadence transaction.

## Reference Solution

:::warning

You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.

:::

- [Reference Solution]

<!-- Relative links.  Will not render on the page -->

[Cadence]: ../index.md
[Access Control]: ../language/access-control.md
[variable]: ../language/constants-and-variables.md
[type annotation]: ../language/type-annotations.md
[Composite Types]: ../language/composite-types.mdx
[multiple controllers]: https://www.coindesk.comwhat-is-a-multisignature-crypto-wallet
[contract area]: ../language/accounts/contracts
[update]: ../language/contract-updatability.md
[account storage]: ../language/accounts/storage.mdx
[Capabilities]: ../language/capabilities.md
[Keys]: ../language/accounts/keys.mdx
[account abstraction]: https://ethereum.org/en/roadmap/account-abstraction
[build an app]: https://developers.flow.com/build/guides/account-linking-with-dapper
[Transaction]: ../language/transactions.md
[transactions]: ../language/transactions.md
[`prepare`]: ../language/transactions.md#prepare-phase
[Cadence types]: ../language/values-and-types.mdx
[Reference Solution]: https://play.flow.com/edba10ad-1232-4720-bc1b-cd34cb12b6dc
[play.flow.com/e559739d-603e-40d5-b2f1-b9957051cdc4]: https://play.flow.com/e559739d-603e-40d5-b2f1-b9957051cdc4
