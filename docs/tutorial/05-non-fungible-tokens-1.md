---
archived: false
draft: false
title: Basic NFT
description: An introduction to a simplified version of NFTs on Cadence.
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

In this tutorial, we're going to deploy, store, and transfer **Non-Fungible Tokens (NFTs)**.  The NFT is an integral part of blockchain technology. An NFT is a digital asset that represents ownership of something unique and indivisible.  Unlike fungible tokens, which operate more like money, you can't divide an NFT, and the owner is likely to be upset if you were to swap one for another without their consent. Examples of NFTs include: [CryptoKitties], [Top Shot Moments], tickets to a really fun concert, or even real property such as a horse or a house!

Production-quality NFTs on Flow implement the [Flow NFT Standard], which defines a basic set of properties for NFTs on Flow.

This tutorial will teach you a basic method of creating simple NFTs to illustrate important language concepts, but will not use the full NFT Standard for the sake of simplicity.

:::tip

If you're already comfortable with Cadence and have found this page looking for information on how to build production-ready NFTs, check out the [NFT Guide] and [Flow NFT Standard] repository.

:::

## Objectives

After completing this tutorial, you'll be able to:

* Deploy a basic NFT contract and type definitions.
* Create an NFT object and store it in a user's account storage.
* Write a transaction to mint an NFT and create a capability so others can view it.
* Transfer an NFT from one account to another.
* Use a script to see if an NFT is stored in an account.
* Implement and utilize a dictionary in Cadence.

## NFTs on Cadence

Instead of being represented in a central ledger, like in most smart contract languages, Cadence represents each NFT as a **[resource] object that users store in their accounts**. This strategy is a response to the lessons learned by the Flow team (the Chief Architect of Flow is the original proposer and co-author of the [ERC-721 NFT standard]).

It allows NFTs to benefit from the resource ownership rules that are enforced by the [type system] - resources can only have a single owner, they cannot be duplicated, and they cannot be lost due to accidental or malicious programming errors. These protections ensure that owners know that their NFT is safe and can represent an asset that has real value, and helps prevent developers from breaking this trust with easy-to-make programming mistakes.

When users on Flow want to transact with each other, they can do so peer-to-peer, without having to interact with a central NFT contract, by calling resource-defined methods in both users' accounts.

NFTs in a real-world context make it possible to trade assets and prove who the owner of an asset is. On Flow, NFTs are interoperable - so the NFTs in an account can be used in different smart contracts and app contexts.

## The Simplest Possible NFT

:::info[Action]

Open the starter code for this tutorial in the Flow Playground:

<a href="https://play.flow.com/ea3aadb6-1ce6-4734-9792-e8fd334af7dc"
  target="_blank">
  https://play.flow.com/ea3aadb6-1ce6-4734-9792-e8fd334af7dc
</a>

:::

At the core, NFTs are simply a way to create true ownership of unique digital property. The simplest possible implementation is a resource with a unique id number.

:::info[Action]

Implement a simple NFT by creating a [resource] with a constant `id` that is assigned in `init`.  The `id` should be public.

:::

```cadence
access(all) resource NFT {

    access(all) let id: UInt64

    init(initID: UInt64) {
        self.id = initID
    }
}
```

### Adding Basic Metadata

An NFT is also usually expected to include some metadata like a name, description, traits, or a picture. Historically, most of this metadata has been stored off-chain, and the on-chain token only contains a URL or something similar that points to the off-chain metadata.

In Flow, this is possible, but you can and normally should store all the metadata associated with a token directly on-chain.  Unlike many other blockchain networks, **you do not need to consider string storage or manipulation as particularly expensive.**

:::tip

This tutorial will stick to a simplified implementation.  Check out the [the NFT metadata guide] if you want to learn how to do this in production.

:::

:::info[Action]

Add a public `metadata` variable to your NFT.  For now, it can be a simple `String` to `String` [dictionary].  Update the `init` to also initialize a `description` in your metadata.

:::

It should now look similar to:

```cadence
access(all) resource NFT {
    access(all) let id: UInt64
    access(all) var metadata: {String: String}

    init(initID: UInt64, initDescription: String) {
        self.id = initID
        self.metadata = {"description": initDescription}
    }
}
```

### Creating the NFT

As with any complex type in any language, now that you've created the definition for the type, you need to add a way to instantiate new instances of that type - these instances are the NFTs.  This simple NFT type must be initialized with an id number and a `String` description.

Traditionally, NFTs are provided with id numbers that indicate the order in which they were minted.  To handle this, you can use a simple counter.

:::info[Action]

First, add a public, contract-level field to keep track of the last assigned id number.

:::

```cadence
access(contract) var counter: UInt64
```

You're going to immediately get an error in the editor with `counter`.  Contract-level fields must be initialized in the `init` function.

:::info[Action]

Add an `init` function to the `BasicNFT` contract and initialize `counter` to zero.

:::

```cadence
init() {
    self.counter = 0
}
```

:::info[Action]

Next, add a public function to increment the counter and `create` and `return` an `NFT` with a provided description.

:::

:::warning

We're creating a **public** function that allows **anyone** to provide **any** string.  Take care when building real apps that will be exposed to humanity.

:::

```cadence
access(all) fun mintNFT(description: String): @NFT {
    self.counter = self.counter + 1
    return <- create NFT(initID: self.counter, initDescription: description)
}
```

Remember, when you work with a [resource], you must use the [move operator] (`<-`) to **move** it from one location to another.

## Adding an NFT Your Account

You've gone through the trouble of creating this NFT contract - you deserve the first NFT!  

:::info[Action]

Protect yourself from snipers by updating the `init` function to give yourself the first `NFT`.  You'll need to mint it and save it to your account storage. 

:::

```cadence
self
    .account
    .storage
    .save(<-self.mintNFT(description: "First one for me!"), to: /storage/BasicNFTPath)
```

### NFT Capability

Saving the NFT to your account will give you one, but it will be locked away where no apps can see or access it.  You've just learned how to create capabilities in the previous tutorial.  You can use the same techniques here to create a capability to give others the ability to access the NFT.

:::warning

In Cadence, users own and control their data.  A user can destroy a capability such as this whenever they choose.  If you want complete control over NFTs or other data, you'd need to store it directly in the contract.

Most of the time, you probably won't want to do this because it will limit what your users can do with their own property without your permission.  You don't want to end up in a situation where your users would buy more of your umbrellas to use for shade on sunny days, except you've made it so that they only open when it's raining.

:::

Cadence contracts are deployed to the account of the deployer.  As a result, the contract is in the deployer's storage, and the contract itself has read and write access to the storage of the account that they are deployed to by using the built-in [`self.account`] field. This is an [account reference] (`&Account`), authorized and entitled to access and manage all aspects of the account, such as account storage, capabilities, keys, and contracts.

You can access any of the account functions with `self.account`.

:::info[Action]

Update the `init` function to create and publish a [capability] allowing public access to the NFT.

:::

```cadence
let capability = self
    .account
    .capabilities
    .storage
    .issue<&NFT>(/storage/BasicNFTPath)

self
    .account
    .capabilities
    .publish(capability, at: /public/BasicNFTPath)
```

:::danger

The capability you are creating gives everyone full access to all properties of the resource.  It does **not** allow other users or developers to move or destroy the resource and is thus harmless.

However, if the resource contained functions to mutate data within the token, this capability would **allow anyone to call it and mutate the data!**

:::

You might be tempted to add this code to to `mintNFT` so that you can reuse it for anyone who wants to mint the NFT and automatically create the related capability.

The code will work, but it will **not** function the way you're probably expecting it to.  In the context of being called from a function inside a contract, `self.account` refers to the account of the contract deployer, not the caller of the function.  That's you!

Adding `self.account.save` or `self.account.publish` to `mintNFT` will allow anyone to attempt to mint and publish capabilities to **your** account, so don't do it!

:::danger

Passing a [fully-authorized account reference] as a function parameter is a dangerous anti-pattern.

::::

### Deploy and Test

:::info[Action]

Deploy the contract and check the storage for account `0x06`.

:::

You'll be able to find your NFT in the storage for `0x06`:

```text
"value": {
    "value": {
        "id": "A.0000000000000006.BasicNFT.NFT",
        "fields": [
            {
                "value": {
                    "value": "41781441855488",
                    "type": "UInt64"
                },
                "name": "uuid"
            },
            {
                "value": {
                    "value": "1",
                    "type": "UInt64"
                },
                "name": "id"
            },
            {
                "value": {
                    "value": [
                        {
                            "key": {
                                "value": "description",
                                "type": "String"
                            },
                            "value": {
                                "value": "First one for me!",
                                "type": "String"
                            }
                        }
                    ],
                    "type": "Dictionary"
                },
                "name": "metadata"
            }
        ]
    },
    "type": "Resource"
}
```

## Get the Number of an NFT Owned by a User

We can see the NFT from the storage view for each account, but it's much more useful to write a script or transaction that can do that for any account.  You can follow a similar technique as the last tutorial and create a script to use the capability.

:::info[Action]

Add a script called `GetNFTNumber` that returns the id number of the nft owned by an address.  It should accept the `Address` of the account you wish to check as an argument

:::

Try to do this on your own.  You should end up with something similar to:


```cadence
import BasicNFT from 0x06

access(all) fun main(address: Address): UInt64 {
  let account = getAccount(address)

  let nftReference = account
    .capabilities
    .borrow<&BasicNFT.NFT>(/public/BasicNFTPath)
    ?? panic("Could not borrow a reference\n")

    return nftReference.id
}
```


## Minting With a Transaction

You usually don't want a contract with just one NFT given to the account holder.  One strategy is to allow anyone who wants to mint an NFT.  To do this, you can simply create a transaction that calls the `mintNFT` function you added to your contract, and adds the capability for others to view the NFT.

:::info[Action]

Create a transaction called `MintNFT.cdc` that mints an NFT for the caller with the `description` they provide.  You'll need entitlements to borrow values, save values, and issue and publish capabilities.

First, verify that the NFT isn't already stored in the location used by the contract.

:::

```cadence MintNFT.cdc
import BasicNFT from 0x06

transaction {
    prepare(acct: auth(
        BorrowValue,
        SaveValue,
        IssueStorageCapabilityController,
        PublishCapability
        ) &Account) {
        if acct.storage.borrow<&BasicNFT.NFT>(from: /storage/BasicNFTPath) != nil {
            panic("This user has a token already!")
        }
        // TODO
    }
}
```

:::info[Action]

Next, use the `mintNFT` function to create an NFT, then save than NFT in the user's account storage.

:::


```cadence
account.storage
    .save(<-BasicNFT.mintNFT(description: "Hi there!"), to: /storage/BasicNFTPath)
```

:::info[Action]

Finally, create and publish a capability to access the NFT.

:::

```cadence
let capability = account
    .capabilities
    .storage
    .issue<&BasicNFT.NFT>(/storage/BasicNFTPath)

account
    .capabilities
    .publish(capability, at: /public/BasicNFTPath)
```

:::info[Action]

Call the `MintNFT` transaction from account `0x06`

:::

It will fail because you minted an NFT with `0x06` when you deployed the contract.

:::info[Action]

Now, call `MintNFT` from account `0x07`.  Then, `Execute` the `GetNFTNumber` script for account `0x07`.

:::

You'll see the NFT number `2` returned in the log.


## Performing a Basic Transfer

Users, independently or with the help of other developers, have the inherent ability to delete or transfer any resources in their accounts, including those created by your contracts.

:::info[Action]

Open the `Basic Transfer` transaction.

:::

We've stubbed out the beginnings of a transfer transaction for you.  Note that we're preparing account references for not one, but **two** accounts - the sender and the recipient.

```cadence Basic Transfer.cdc
import BasicNFT from 0x06

transaction {
    prepare(
        signer1: auth(LoadValue) &Account,
        signer2: auth(SaveValue) &Account
    ) {
        // TODO
    }
}
```

While a transaction is open, you can select one or more accounts to sign a transaction. This is because, in Flow, multiple accounts can sign the same transaction, giving access to their private storage.


:::info[Action]

Write a transaction to execute the transfer. You'll need to `load()` the NFT from `signer1`'s storage and `save()` it into `signer2`'s storage.

:::


```cadence
import BasicNFT from 0x06

transaction {
    prepare(
        signer1: auth(LoadValue) &Account,
        signer2: auth(SaveValue) &Account
    ) {
        let nft <- signer1.storage.load<@BasicNFT.NFT>(from: /storage/BasicNFTPath)
            ?? panic("Could not load NFT from the first signer's storage")

        // WARNING:  Incomplete code, see below
        signer2.storage.save(<-nft, to: /storage/BasicNFTPath)
    }
}
```

:::info[Action]

Select both account `0x06` and account `0x08` as the signers. Make sure account `0x06` is the first signer.

Click the "Send" button to send the transaction.

Verify the NFT is in account storage for account `0x08`.

:::

What about using your nifty script to check if a user has an NFT?


:::info[Action]

Run `GetNFTNumber` to check account `0x08`.

:::

**You'll get an error here.**  The reason is that you haven't created or published a capability on account `0x08`.  You can do this as a part of your transaction, but remember that it isn't required.  Another dev, or sophisticated user, could do the transfer **without** publishing a capability.

:::info[Action]

On your own, refactor your transaction to publish a capability in the new owner's account.

You're also not making sure that the recipient doesn't already have an NFT in the storage location, so go ahead and add that check as well.

:::

### Capabilities Referencing Moved Objects

What about the capability you published for account `0x06` to access the NFT?  What happens to that?

:::info[Action]

Run `GetNFTNumber` for account `0x06`. 

:::

**You'll get an error** here as well, but this is expected.  Capabilities that reference an object in storage return `nil` if that storage path is empty.

:::danger

The capability itself is not deleted.  If you move an object of the same type back to the storage location reference by the capability, the capability **will** function again.

:::

## Reviewing Basic NFTs

In this tutorial, you learned how to create a basic NFT with minimal functionality.  Your NFT can be held, viewed, and transferred, though it does **not** adhere to the official standard, doesn't allow anyone to own more than one, and is missing other features.

Now that you have completed the tutorial, you should be able to:

* Deploy a basic NFT contract and type definitions.
* Create an NFT object and store it in a user's account storage.
* Write a transaction to mint an NFT and create a capability so others can view it.
* Transfer an NFT from one account to another.
* Use a script to see if an NFT is stored in an account.

In the next tutorial, you'll learn how to make more complete NFTs that allow each user to possess many NFTs from your collection.

---

<!-- Reference-style links, does not render on page -->

[NFT Guide]: https://developers.flow.com/build/guides/nft
[CryptoKitties]: https://www.cryptokitties.co/
[Top Shot Moments]: https://nbatopshot.com/
[resource]: ../language/resources.mdx
[ERC-721 NFT standard]: https://github.com/ethereum/eips/issues/721
[type system]: ../language/values-and-types.mdx
[Flow NFT Standard]: https://github.com/onflow/flow-nft
[the NFT metadata guide]: https://developers.flow.com/build/advanced-concepts/metadata-views
[dictionary]: ../language/values-and-types.mdx#dictionary-types
[move operator]: ../language/operators.md#move-operator--
[`self.account`]: ../language/contracts.mdx
[account reference]: ../language/accounts/index.mdx
[capability]: ../language/capabilities.md
[fully-authorized account reference]: ../anti-patterns.md#avoid-using-fully-authorized-account-references-as-a-function-parameter