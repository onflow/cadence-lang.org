---
archived: false
draft: false
title: 5.1 Non-Fungible Token Tutorial Part 1
description: An introduction to NFTs on Cadence
date: 2024-09-17
meta:
  keywords:
    - tutorial
    - Flow
    - NFT
    - Non-Fungible Tokens
    - Cadence
    - Resources
    - Capabilities
tags:
  - reference
  - NFT
  - Non-Fungible Token
  - cadence
  - tutorial
socialImageTitle: Non-Fungible Tokens in Cadence
socialImageDescription: NFT social image.
---

In this tutorial, we're going to deploy, store, and transfer **Non-Fungible Tokens (NFTs)**.

---

:::tip

Open the starter code for this tutorial in the Flow Playground:

<a href="https://play.flow.com/dde1e2a4-aae6-4eda-86fd-f0b0b3f53f7e"
  target="_blank">
  https://play.flow.com/dde1e2a4-aae6-4eda-86fd-f0b0b3f53f7e
</a>
The tutorial will ask you to take various actions to interact with this code.

:::

:::info[Action]

Instructions that require you to take action are always included in a callout box like this one.
These highlighted actions are all that you need to do to get your code running,
but reading the rest is necessary to understand the language's design.

:::

The NFT is an integral part of blockchain technology.
An NFT is a digital asset that represents ownership of a unique asset.
NFTs are also indivisible, you can't trade part of an NFT.
Possible examples of NFTs include:
CryptoKitties, Top Shot Moments, tickets to a really fun concert, or a horse.

Instead of being represented in a central ledger, like in most smart contract languages,
Cadence represents each NFT as a [resource object](../language/resources)
that users store in their accounts.

This allows NFTs to benefit from the resource ownership rules
that are enforced by the [type system](../language/values-and-types.mdx) -
resources can only have a single owner, they cannot be duplicated,
and they cannot be lost due to accidental or malicious programming errors.
These protections ensure that owners know that their NFT is safe and can represent an asset that has real value.

NFTs in a real-world context make it possible to trade assets and
prove who the owner of an asset is.
On Flow, NFTs are interoperable -
so the NFTs in an account can be used in different smart contracts and app contexts.
All NFTs on Flow implement the [Flow NFT Standard](https://github.com/onflow/flow-nft)
which defines a basic set of properties for NFTs on Flow.
This tutorial, will teach you a basic method of creating NFTs
to illustrate important language concepts, but will not use the NFT Standard
for the sake of simplicity and learning.

After completing the NFT tutorials, readers should visit
[the NFT Guide](https://developers.flow.com/build/guides/nft) and
[the NFT standard GitHub repository](https://github.com/onflow/flow-nft)
to learn how full, production-ready NFTs are created.

To get you comfortable using NFTs, this tutorial will teach you to:

1. Deploy a basic NFT contract and type definitions.
2. Create an NFT object and store it in your account storage.
3. Create an NFT collection object to store multiple NFTs in your account.
4. Create an `NFTMinter` and use it to mint an NFT.
5. Create capabilities to your collection that others can use to send you tokens.
6. Set up another account the same way.
7. Transfer an NFT from one account to another.
8. Use a script to see what NFTs are stored in each account's collection.

:::warning

It is important to remember that while this tutorial implements a working
non-fungible token, it has been simplified for educational purposes and is not
what any project should use in production. See the
<a href="https://github.com/onflow/flow-nft" target="_blank">Flow Fungible Token standard</a>
for the standard interface and example implementation.

:::

**Before proceeding with this tutorial**, we highly recommend
following the instructions in [Getting Started](./01-first-steps.md),
[Hello, World!](./02-hello-world.md),
[Resources](./03-resources.md),
and [Capabilities](./04-capabilities.md)
to learn how to use the Playground tools and to learn the fundamentals of Cadence.
This tutorial will build on the concepts introduced in those tutorials.

## Non-Fungible Tokens on the Flow Emulator

---

In Cadence, each NFT is represented by a resource with an integer ID:
```cadence
// The most basic representation of an NFT
access(all) resource NFT {
    // The unique ID that differentiates each NFT
    access(all)
    let id: UInt64

    // Initialize both fields in the initializer
    init(initID: UInt64) {
        self.id = initID
    }
}
```

Resources are a perfect type to represent NFTs
because resources have important ownership rules that are enforced by the type system.
They can only have one owner, cannot be copied, and cannot be accidentally or maliciously lost or duplicated.
These protections ensure that owners know that their NFT is safe and can represent an asset that has real value.
For more information about resources, see the [resources tutorial](./03-resources.md)

An NFT is also usually represented by some sort of metadata like a name or a picture.
Historically, most of this metadata has been stored off-chain,
and the on-chain token only contains a URL or something similar that points to the off-chain metadata.
In Flow, this is possible, but the goal is to make it possible for all the metadata associated with a token to be stored on-chain.
This is out of the scope of this tutorial though.
This paradigm has been defined by the Flow community and the details are contained in
[the NFT metadata guide](https://developers.flow.com/build/advanced-concepts/metadata-views).

When users on Flow want to transact with each other,
they can do so peer-to-peer and without having to interact with a central NFT contract
by calling resource-defined methods in both users' accounts.

## Adding an NFT Your Account

We'll start by looking at a basic NFT contract that adds an NFT to an account.
The contract will:

1. Create a smart contract with the NFT resource type.
2. Declare an ID field, a metadata field and an initializer in the NFT resource.
3. Create an initializer for the contract that saves an NFT to an account.

This contract relies on the [account storage API](../language/accounts/storage.mdx)
to save NFTs in the account.

:::info[Action]

First, you'll need to follow this link to open a playground session
with the Non-Fungible Token contracts, transactions, and scripts pre-loaded:

<a href="https://play.flow.com/dde1e2a4-aae6-4eda-86fd-f0b0b3f53f7e" target="_blank">
  https://play.flow.com/dde1e2a4-aae6-4eda-86fd-f0b0b3f53f7e
</a>

:::

:::info[Action]

Open Account `0x06` to see `BasicNFT.cdc`.
`BasicNFT.cdc` should contain the following code:

:::

```cadence BasicNFT.cdc
access(all) contract BasicNFT {

    // Declare the NFT resource type
    access(all) resource NFT {
        // The unique ID that differentiates each NFT
        access(all) let id: UInt64

        // String mapping to hold metadata
        access(all) var metadata: {String: String}

        // Initialize both fields in the initializer
        init(initID: UInt64) {
            self.id = initID
            self.metadata = {}
        }
    }

    // Function to create a new NFT
    access(all) fun createNFT(id: UInt64): @NFT {
        return <-create NFT(initID: id)
    }

    // Create a single new NFT and save it to account storage
    init() {
        self.account.storage.save(<-create NFT(initID: 1), to: /storage/BasicNFTPath)
    }
}
```

In the above contract, the NFT is a resource with an integer ID and a field for metadata.

Each NFT resource should have a unique ID, so they cannot be combined or duplicated
unless the smart contract allows it.

Another unique feature of this design is that each NFT can contain its own metadata.
In this example, we use a simple `String`-to-`String` mapping, but you could imagine a [much more rich
version](https://github.com/onflow/flow-nft#nft-metadata)
that can allow the storage of complex file formats and other such data.

An NFT could even own other NFTs! This functionality is shown in a later tutorial.

### Initializers

```cadence
init() {
// ...
```

All composite types like contracts, resources,
and structs can have an optional initializer that only runs when the object is initially created.
Cadence requires that all fields in a composite type must be explicitly initialized,
so if the object has any fields, this function has to be used to initialize them.

Contracts also have read and write access to the storage of the account that they are deployed to
by using the built-in [`self.account`](../language/contracts.mdx) field.
This is an [account reference](../language/accounts/index.mdx) (`&Account`),
authorized and entitled to access and manage all aspects of the account,
such as account storage, capabilities, keys, and contracts.

In the contract's initializer, we create a new NFT object and move it into the account storage.

```cadence
// put it in storage
self.account.storage.save(<-create NFT(initID: 1), to: /storage/BasicNFTPath)
```

Here we access the storage object of the account that the contract is deployed to and call its `save` method.
We also create the NFT in the same line and pass it as the first argument to `save`.
We save it to the `/storage/` domain, where objects are meant to be stored.

:::info[Action]

Deploy `BasicNFT` by clicking the Deploy button in the top right of the editor.

:::

You should now have an NFT in your account. Let's run a transaction to check.

:::info[Action]

Open the `NFT Exists` transaction, select account `0x06` as the only signer, and send the transaction.

`NFT Exists` should look like this:

:::

```cadence NFTExists.cdc
import BasicNFT from 0x06

// This transaction checks if an NFT exists in the storage of the given account
// by trying to borrow from it. If the borrow succeeds (returns a non-nil value), the token exists!
transaction {
    prepare(acct: auth(BorrowValue) &Account) {
        if acct.storage.borrow<&BasicNFT.NFT>(from: /storage/BasicNFTPath) != nil {
            log("The token exists!")
        } else {
            log("No token found!")
        }
    }
}
```

Here, we are trying to directly borrow a reference from the NFT in storage.
If the object exists, the borrow will succeed and the reference optional will not be `nil`,
but if the borrow fails, the optional will be `nil`.

You should see something that says `"The token exists!"`.

Great work! You have your first NFT in your account. Let's move it to another account!

## Performing a Basic Transfer

With these powerful assets in your account, you'll probably want to
move them around to other accounts. There are many ways to transfer objects in Cadence,
but we'll show the simplest one first.

This will also be an opportunity for you to try to write some of your own code!

:::info[Action]

Open the `Basic Transfer` transaction.

`Basic Transfer` should look like this:

:::

```cadence
import BasicNFT from 0x06

/// Basic transaction for two accounts to authorize
/// to transfer an NFT

transaction {
    prepare(
        signer1: auth(LoadValue) &Account,
        signer2: auth(SaveValue) &Account
    ) {

        // Fill in code here to load the NFT from signer1
        // and save it into signer2's storage

    }
}
```

We've provided you with a blank transaction with two signers.

While a transaction is open, you can select one or more accounts to sign a transaction.
This is because, in Flow, multiple accounts can sign the same transaction,
giving access to their private storage. If multiple accounts are selected as signers,
this needs to be reflected in the signature of the transaction to show multiple signers,
as is shown in the "Basic Transfer" transaction.

All you need to do is `load()` the NFT from `signer1`'s storage and `save()` it
into `signer2`'s storage. You have used both of these operations before,
so this hopefully shouldn't be too hard to figure out.
Feel free to go back to earlier tutorials to see examples of these account methods.

You can also scroll down a bit to see the correct code:

---
---
---
---
---
---
---
---
---

Here is the correct code to load the NFT from one account and save it to another account.

```cadence
import BasicNFT from 0x06

/// Basic transaction for two accounts to authorize
/// to transfer an NFT

transaction {
    prepare(
        signer1: auth(LoadValue) &Account,
        signer2: auth(SaveValue) &Account
    ) {

        // Load the NFT from signer1's account
        let nft <- signer1.storage.load<@BasicNFT.NFT>(from: /storage/BasicNFTPath)
            ?? panic("Could not load NFT from the first signer's storage")

        // Save the NFT to signer2's account
        signer2.storage.save(<-nft, to: /storage/BasicNFTPath)

    }
}
```

:::info[Action]

Select both Account `0x06` and Account `0x07` as the signers.
Make sure account `0x06` is the first signer.<br/>
Click the "Send" button to send the transaction.

:::

Now, the NFT should be stored in the storage of Account `0x07`!
You should be able to run the "NFT Exists" transaction again with `0x07` as the signer
to confirm that it is in their account.

## Enhancing the NFT Experience

Hopefully by now, you have an idea of how NFTs can be represented by resources in Cadence.
You might have noticed by now that if we required users
to remember different paths for each NFT and to use a multisig transaction for transfers,
we would not have a very friendly developer and user experience.

This is where the true utility of Cadence is shown.
Continue on to the [next tutorial](./05-non-fungible-tokens-2.md)
to find out how we can use capabilities and resources owning other resources
to enhance the ease of use and safety of our NFTs.

---