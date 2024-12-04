---
archived: false
draft: false
title: First Steps
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
socialImageTitle: Cadence First Steps
socialImageDescription: Take your first steps to learn the Cadence smart contract programming language.
---

Welcome to our series of guides that will get you up to speed on [Cadence] as quickly as possible!  In this program, you'll jump right into making meaningful projects.  Don't worry, we'll point you to the important parts of the language reference as each concept is introduced!

This series makes use of the [Flow Playground] - an online IDE that enables you to easily write and test Cadence code in a simulated environment.

:::tip

If you already know Solidity, you might want to review the [Cadence Guide for Solidity Developers].  It compares the two languages and points out the most impactful differences from the perspective of a Solidity dev.

:::

## Objectives

After completing this tutorial, you'll be able to:

* Write, deploy, and interact with Cadence code in the Flow Playground.
* Select and utilize accounts in the Flow Playground.
* Run Cadence transactions from the playground.
* Explore the contracts and storage associated with test accounts.


:::info[Action]

Instructions that require you to take action are always included in a call out box like this one.

:::

## The Flow Developer Playground

![Flow Playground](flow-playground.png)

The [Flow Playground] includes an in-browser editor and Flow emulator that you can use to experiment with Flow Cadence.  Using the Flow Playground, you can write Cadence smart contracts, deploy them to a local Flow emulated blockchain, and submit transactions.

It has been primarily tested and optimized for Google Chrome, but other browsers will should work as well.

The playground comes pre-loaded with contract and transaction templates that correspond to each of the tutorials in this series.  At the top of the page, you'll find it in a call out like this one:

:::info[Action]

Open the starter code for this tutorial in the Flow Playground: <br />
<a
  href="https://play.flow.com/"
  target="_blank"
>
  https://play.flow.com/
</a>

:::

When you click on one of these links, the tutorial code will open in a new tab and the contracts, transactions, and scripts will be loaded into the templates in the Playground for you to use. You will need to navigate between the editor and this tutorial to read instructions and make changes to your code.

## What is a smart contract?

In regular terms, a contract is an agreement between two parties for some exchange of information or assets. Normally, the terms of a contract are supervised and enforced by a trusted third party, such as a bank or a lawyer.

A smart contract is a computer program stored in a blockchain that verifies and executes the performance of a contract without the need for any trusted third party.  The code itself is public and will perform all operations in an open, repeatable, and testable manner.

Programs that run on blockchains are commonly referred to as smart contracts because they facilitate important functions, such as managing digital currency, without relying on a central authority like a bank.

Flow can run smart contracts written in [Cadence].  It can also run older contracts written in Solidity, on the [Flow EVM].  These guides focus on learning Cadence.

## Accounts

Accounts are the primary conduit for user interaction with on-chain code and assets.  Users authorize transactions with their accounts and store their owned assets in their account storage.

:::warning

Flow is different from most other blockchains in that contracts, assets, and information owned by a user or associated with their wallet address **are stored in the user's account**.

:::

The Flow playground comes with pre-created accounts that you can use for testing and experimentation.

They're listed in the `Accounts` section on the bottom left part of the playground window.

![Playground Intro](playground-intro.png)

:::info[Action]

Click on a few of the accounts.  They're empty when first created, but you'll see contracts and storage data here as you go through the tutorials.

:::

![Account View](playground-account-view.png)

## Contracts

The playground organizes contract source files under `Contracts` folder in the nav panel on the left side of the window.  Until deployed, these are source files that are not associated with an account or address.

The default contract in a new playground session is a simple `HelloWorld` contract.

When you have Cadence code open in the account editor that contains a contract, you can click the deploy button in the bottom-right of the screen to deploy that contract to the currently selected account.

![Deploy Contract](deploybox.png)

:::info[Action]

Click the button to `Deploy` the contract.

:::

After a few seconds, the contract will deploy. 

:::info[Action]

Select `0x06-Default` in the `Accounts` list.

:::


You'll see the name of the contract and the block height it was deployed at in the list of `Deployed Contracts`.  You'll also see that there are `FlowToken` objects listed in the `Account Storage` section. Every Flow account is created with the ability to manage Flow Tokens.

![Full Storage View](full-storage.png)

## Scripts

In Cadence, scripts are simple, transaction-like snippets of code that you can use to **read** onchain data that is public.

:::info[Action]

Open the `GetGreeting` script and `Execute` it.

:::

You'll see the `result` logged in the console.

## Transactions

Cadence transactions are also written in Cadence.

In the `Transactions` folder, you'll find an example of one.

:::info[Action]

Open the `ChangeGreeting` transaction, enter a new `greeting`, and `Send` it. 

:::

Once the transaction completes, you'll see the output in the `Log` at the bottom of the window.

:::info[Action]

Open the `GetGreeting` script and `Execute` it again.

:::

You'll now see your new greeting returned in the log!

## Say Hello, World!

You're now ready to write your own contract and say "Hello World!"

Now that you have completed the tutorial, you can:

* Write, deploy, and interact with Cadence code in the Flow Playground.
* Select and utilize accounts in the Flow Playground.
* Run Cadence transactions from the playground.
* Explore the contracts and storage associated with test accounts.

<!-- Relative links.  Will not render on the page -->

[Cadence]: ../index.md
[Flow Playground]: https://play.flow.com
[Cadence Guide for Solidity Developers]: ../solidity-to-cadence.md
[Flow EVM]: https://developers.flow.com/evm/about
[Account Model]: ../docs/language/accounts/