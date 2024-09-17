---
title: 1. First Steps
---

In this tutorial, we will learn how to use smart contracts, switch accounts, and view account state.

## What is Cadence?

---

Cadence is a new smart contract programming language for use on the Flow Blockchain.
Cadence introduces new features to smart contract programming that help developers ensure that their code is safe, secure, clear, and approachable. Some of these features are:

- Type safety and a strong static type system
- Resource-oriented programming, a new paradigm that pairs linear types with object capabilities to create a secure and declarative model for digital ownership
  by ensuring that resources (and their associated assets) can only exist in one location at a time, cannot be copied, and cannot be accidentally lost or deleted
- Built-in pre-conditions and post-conditions for functions and [transactions](../language/transactions.md)
- The utilization of capability-based security and entitlements,
  which enforces access control by requiring that access to objects
  is restricted to only the owner and those who have a valid reference to the object

Please see the [Cadence introduction](../index.md) for more information about the high level design of the language.

## What is the Flow Developer Playground?

---

The [Flow Playground](https://play.flow.com) includes
an in-browser editor and Flow emulator to experiment with Flow.
Using the Flow Playground, you can write Cadence smart contracts,
deploy them to a local Flow emulated blockchain, and submit transactions.

The Flow Playground should work with any standard web browser.
However, we recommend using Google Chrome, as it has been primarily tested and optimized for this browser.

## Getting to know the Playground

The Playground contains everything you need to get familiar
with deploying Cadence smart contracts and interacting with transaction and scripts.

The Playground comes pre-loaded with contract and transaction templates
that correspond to each of the tutorials in the docs site.
To load the contracts for a specific tutorial, open the desired tutorial
in the sidebar here and click the link in the callout box at the beginning of the tutorial.

The callout boxes should look like this:

<Callout type="success">
  Open the starter code for this tutorial in the Flow Playground: <br />
  <a
    href="https://play.flow.com/"
    target="_blank"
  >
    https://play.flow.com/
  </a>
</Callout>

When you click on one of these links, the tutorial code will open in a new tab
and the contracts, transactions, and scripts will be loaded 
into the templates in the Playground for you to use.
You will need to navigate between the editor and this tutorial to read instructions
and make changes to your code.

## What is a smart contract?

In regular terms, a contract is an agreement between two parties for some exchange of information or assets.
Normally, the terms of a contract are supervised and enforced by a trusted third party, such as a bank or a lawyer.

A smart contract is a computer program stored in a network like a blockchain
that verifies and executes the performance of a contract (like a lawyer does)
without the need for any trusted third party anywhere in the process, because the code itself is trusted.

Programs that run on blockchains are commonly referred to as smart contracts
because they facilitate important functions, such as managing digital currency,
without relying on a central authority like a bank.

[Cadence is the premier resource-oriented programming language](../index.md)
for developing smart contracts and is currently
the primary smart contract programming language on the Flow Blockchain.

## Accounts and Contracts

In addition to smart contracts, blockchains also have accounts.
Accounts are the primary conduit for user interaction with on-chain code and assets.
Users authorize transactions with their accounts
and store their owned assets in their account storage.

The Flow playground comes with pre-created accounts that you can use automatically.

The Accounts section on the bottom left part of the screen is where the active accounts are listed.

![Playground Intro](playground-intro.png)

An account can have multiple smart contracts deployed to it, which will be covered later.
When you click on an account, you will see a view of the contracts
that are associated with that account in the main editor as well as
a list of what is in that account's storage.

By default, every account should have no deployed contracts and nothing in storage.

![Account View](playground-account-view.png)

You can click on a contract name under `Contracts` on the left side of the screen
to see the code of Contracts that are associated with an account.
The default contract in a new playground session is a simple `HelloWorld` contract.

When you have Cadence code open in the account editor that contains a contract,
you can click the deploy button in the bottom-right of the screen
to deploy that contract to the currently selected account.

![Deploy Contract](deploybox.png)

After a few seconds, the contract should deploy. In the accounts section, you should 
now see the name of the contract next to the selected account that you deployed too
and if you click on "Log" in the bottom section of the screen, you should 
see a message in the console confirming that the contract was deployed
and which account it was deployed to.
This will also show any errors that might have happened as part of deployment.

You can additionally click on the account that has the contract deployed to it
and look at the editor again. You'll now see that the `HelloWorld` contract is deployed
and you'll also see that there are `FlowToken` objects listed in the `Account Storage`
section. 

![Full Storage View](full-storage.png)

Every Flow account is created with the ability to manage Flow Tokens.
Right now, you don't need to worry about the specifics here because you will learn later.

You can also select transactions and scripts from the left selection menu
and submit them to interact with your deployed smart contracts,
which will be covered in the Hello World tutorial.

This is just a small set of the things you can do with the Playground.
The rest of the tutorials will cover all the features in much more detail.

## Resources

Each tutorial in this package uses several files containing transactions, contracts, and scripts.
Each tutorial contains a link to a pre-made Cadence project that contains
all the code that you'll need to execute to complete the tutorial.
Additionally, all the code is provided within the tutorials in case you
would like to copy and paste it into your playground project yourself.

## Say Hello, World!

Now that you have the Flow Developer Playground running,
you can [create a smart contract](./02-hello-world.md) for Flow!
