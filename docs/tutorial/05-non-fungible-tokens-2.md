---
archived: false
draft: false
title: Intermediate NFTs
description: Learn how to manage collections of NFTs in Cadence
date: 2024-09-18
meta:
  keywords:
    - tutorial
    - Flow
    - NFT
    - Non-Fungible Tokens
    - Cadence
    - Resources
    - Capabilities
    - Collection
    - Dictionary
tags:
  - reference
  - NFT
  - Non-Fungible Token
  - cadence
  - tutorial
socialImageTitle: Intermediate NFTs in Cadence
socialImageDescription: NFT social image.
---

In the [last tutorial], you implemented a simple NFT that users could mint, hold, and trade, but there was a serious flaw - each user could only hold one NFT at a time.  In this tutorial, you'll improve your implementation to allow it to be able to grant users multiple NFTs and the tools needed to manage them.

:::tip

If you're already comfortable with Cadence and have found this page looking for information on how to build production-ready NFTs, check out the [NFT Guide] and [Flow NFT Standard] repository.

:::

## Objectives

After completing this tutorial, you'll be able to:

* Implement a collection [resource] that can manage multiple NFTs on behalf of a user.
* Create an [entitlement] to limit some functionality of a [resource] to the owner.
* Handle errors more elegantly with functions that generate error messages.

## Storing Multiple NFTs in a Collection

:::info[Action]

Open the starter code for this tutorial in the Flow Playground:
<a
href="https://play.flow.com/9da6f80f-cd79-4797-a067-47a57dc54770"
target="_blank"
>
https://play.flow.com/9da6f80f-cd79-4797-a067-47a57dc54770
</a>

:::

This tutorial continues from the last one, but we'll be doing significant refactoring.  The provided starter contains the NFT resource, but removes the code and transactions for creating NFTs and capabilities to interact with them.  You'll replace those with a more sophisticated approach that will allow collections of NFTs.

It also adds some constants for the paths we'll be using so we don't need to worry about typos as we add them to several transactions and scripts.

As you've likely noticed the setup and operations that we used in the previous tutorial are not very scalable. Users need a way to store multiple NFTs from a collection and tools to manage all of those NFTs from a single place.

Using a [dictionary] on its own to store our NFTs would solve the problem of having to use different storage paths for each NFT, but it doesn't solve all the problems.

### Resources that Own Resources

Instead, we can use a powerful feature of Cadence, resources owning other resources! We'll define a new `Collection` resource as our NFT storage place to enable more-sophisticated ways to interact with our NFTs.  This pattern comes with interesting powers and side effects.

Since the `Collection` explicitly owns the NFTs in it, the owner could transfer all of the NFTs at once by just transferring the single collection. In addition to allowing easy batch transfers, this means that if a unique NFT wants to own another unique NFT, like a CryptoKitty owning a hat accessory, the Kitty literally stores the hat in its own fields and effectively owns it.

The hat belongs to the CryptoKitty that it is stored in, and the hat can be transferred separately or along with the CryptoKitty that owns it. Cadence is a fully object-oriented language, so ownership is indicated by where an object is stored, not just an entry on a ledger.

:::danger

When the NFT `Collection` resource is destroyed with the `destroy` command, all the resources stored in the dictionary are also `destroy`ed.

:::

### NFT Collection

:::info[Action]

Add a public resource definition called `Collection` to the `IntermediateNFT` contract.  In it, add a public [dictionary] called `ownedNFTs` that maps `NFT`s to their `Uint64` id numbers.  Initialize `ownedNFTs` with an empty dictionary. 

:::

```cadence
access(all) resource Collection {
    access(all) var ownedNFTs: @{UInt64: NFT}

    init () {
        self.ownedNFTs <- {}
    }
}
```

:::tip

Cadence is an object-oriented language.  Inside of a composite type, such as a [resource], `self` refers to the instance of that type and **not** the contract itself.

:::

Dictionary definitions don't usually have the `@` symbol in the type specification, but because the `myNFTs` mapping stores resources, the whole field must become a resource type.  Therefore, you need the `@` symbol indicating that `ownedNFTs` is a resource type.

As a result, all the rules that apply to resources apply to this type.

### Utility Functions

It's helpful for a collection to be able to handle some basic operations, such as accepting an NFT into the collection, validating whether or not a token is present, or sharing a list of all token IDs.

:::info[Action]

Write a function to `deposit` a token into `ownedNFTs`:

:::

```cadence
access(all) fun deposit(token: @NFT) {
    self.ownedNFTs[token.id] <-! token
}
```

:::tip

Notice that we're using the `<-!` force assignment operator to move the token.  This will still give a runtime error if the location already has something else stored, but it won't give a typecheck error like the `<-` move operator would in this instance.

:::

:::info[Action]

Next, write a function called `idExists` that returns a `Bool` - `true` if the id is present and `false` if it is not.

Also write a function called `getIDs` that returns an array of the `UInt64` ids of all NFTs found in the collection.  Make use of the built-in `keys` function present on the dictionary type.

:::

```cadence
access(all) view fun idExists(id: UInt64): Bool {
    return self.ownedNFTs[id] != nil
}

access(all) view fun getIDs(): [UInt64] {
    return self.ownedNFTs.keys
}
```

## Withdrawing NFTs

For the NFT `Collection`, we will publish a capability to allow anyone to access the utility functions you just created - depositing NFTs into it, verifying if an NFT is in the collection, or getting the ids of all NFTs present.  We'll also need functionality to withdraw an NFT and remove it from the collection, but we obviously **don't** want anyone to be able to do that.

### Capability Security

This is where an important layer of access control comes in. Cadence utilizes [capability security], which means that for any given object, a user is allowed to access a field or method of that object if they either:

- Are the owner of the object
- Have a valid reference to that field or method (note that references can only be created from capabilities, and capabilities can only be created by the owner of the object)

When a user stores their NFT `Collection` in their account storage, it is by default not available for other users to access because it requires access to the authorized account object (`auth(Storage) &Account`) which is only accessible by a transaction that the owner authorizes and signs.

To give external accounts access to the `access(all)` fields and functions, the owner (usually with the help of a developer creating a transaction) creates a link to the object in storage.

This link creates a capability. From there, it could be passed as a parameter to a function for one-time-use, or it could be put in the `/public/` domain of the user's account so that anyone can access it.

You've done this already when you've written transactions to `issue` and `publish` capabilities.

### Using Entitlements

We do not want everyone in the network to be able to call our `withdraw` function though.

In Cadence, any reference can be freely up-casted or down-casted to any subtype or supertype that the reference conforms to. This means that if you had a reference of the type `&ExampleNFT.Collection`, this would expose all the `access(all)` functions on the `Collection`. 

This is a powerful feature that is very useful, but it means if there is any privileged functionality on a resource that has a public capability, then this functionality cannot be `access(all)`.

It needs to use [entitlements].

Entitlements enable you to restrict the scope of access at a granular level, with the option to group restrictions under similarly named entitlements. Owners of resources can then use these entitlements to grant access to the subset of actions enabled by the authorized reference.

:::tip

If you're used to Solidity, you can think of this as being similar to frameworks that enable you to use modifiers to limit some functions to specific addresses with the correct role, such as `onlyOwner`.

:::

:::info[Action]

Define an [entitlement] called `Withdraw` in your contract, at the contract level.

:::

```cadence
access(all) entitlement Withdraw
```

You've now effectively created a type of lock that can only be opened by someone with the right key - or the owner of the property, who always has access natively.

:::info[Action]

Implement a `withdraw` function.  It should:

* Only allow `access` to addresses with the `Withdraw` [entitlement].
* Accept the id of the NFT to be withdrawn as an argument
* Return an error if the NFT with that id is not present in the account's `ownedNFTs`
* Return the **actual token resource**

:::

You should end up with something similar to:

```cadence
access(Withdraw) fun withdraw(withdrawID: UInt64): @NFT {
    let token <- self.ownedNFTs.remove(key: withdrawID)
        ?? panic("Could not withdraw an ExampleNFT.NFT with id="
            .concat(withdrawID.toString())
            .concat("Verify that the collection owns the NFT ")
            .concat("with the specified ID first before withdrawing it."))

    return <-token
}
```

Providing an access scope of `access(Withdraw)` locks this functionality to only the owner that has the [resource] directly in their storage, **or** to any address possessing a reference to this resource that has the `Withdraw` entitlement.

As with other types defined in contracts, these are namespaced to the deployer and contract.  The full name of `Withdraw` would be something like `0x06.IntermediateNFT.Withdraw`.  More than one contract or account can declare separate and distinct entitlements with the same name.

### Issuing an Entitlement

The owner of an object is the only one who can sign a transaction to create an entitled capability or reference.

In the above example, if you wanted to make the withdraw function publicly accessible,
you could issue the capability as an entitled capability by specifying all the entitlements in the capability's type specification
using the `auth` keyword:

```cadence
// DANGEROUS CODE EXAMPLE - DO NOT USE
let cap = self.account.capabilities.storage.issue<auth(ExampleNFT.Withdraw) &ExampleNFT.Collection>(self.CollectionStoragePath)
self.account.capabilities.publish(cap, at: self.CollectionPublicPath)
```

Now, anyone could borrow that capability as the entitled version it was issued as:

```cadence
let entitledCollectionRef = recipient.capabilities
    .borrow<auth(ExampleNFT.Withdraw) &ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)
    ?? panic("Could not borrow a reference to the ExampleNFT.Collection")

let stolenNFT <- entitledCollectionRef.withdraw(withdrawID: 1)
```

Later tutorials will cover more nuanced methods for sharing an [entitlement].

## Error Handling

Thinking ahead, many of the transactions that we might write (or other developers composing on our contracts) will need to borrow a reference to a user's collection.  We can make everyone's lives easier by adding a function to help create that error in a nice and consistent manner.

:::info[Action]

Write a function called `collectionNotConfiguredError` that accepts an `address` and returns a descriptive error message that the collection was not found.

:::

```cadence
access(all) fun collectionNotConfiguredError(address: Address): String {
    return "Could not borrow a collection reference to recipient's IntermediateNFT.Collection"
        .concat(" from the path ")
        .concat(IntermediateNFT.CollectionPublicPath.toString())
        .concat(". Make sure account ")
        .concat(address.toString())
        .concat(" has set up its account ")
        .concat("with an IntermediateNFT Collection.")
    }
```

## Deploy the Contract

:::info[Action]

Deploy the `IntermediateNFT` contract with account `0x06`.

:::


## Creating Collections

We'll need several transactions to manage our NFT collection.  The first is one to allow users to create a collection on their account.

:::info[Action]

On your own, implement a transaction in `CreateCollection.cdc` to create and save a `Collection` in the caller's account and also `issue` and `publish` a capability for that collection.

:::

You should end up with something similar to:

```cadence
import IntermediateNFT from 0x06

transaction {
    prepare(account: auth(SaveValue, Capabilities) &Account) {
        // You may want to make sure one doesn't exist, but the native error is descriptive as well
        let collection <- IntermediateNFT.createEmptyCollection()

        account.storage.save(<-collection, to: IntermediateNFT.CollectionStoragePath)

        log("Collection created")

        let cap = account.capabilities.storage.issue<&IntermediateNFT.Collection>(IntermediateNFT.CollectionStoragePath)
        account.capabilities.publish(cap, at: IntermediateNFT.CollectionPublicPath)

        log("Capability created")
    }
}
```

:::info[Action]

Test your transaction by creating `Collections` for several accounts.  Try it with accounts that do and do **not** have `Collections` already, and verify that the correct behavior occurs.

:::

## Minting an NFT

:::info[Action]

Next, add a transaction to mint an nft and grant it to the caller.  Use the `prepare` phase to `borrow` a reference to the caller's `Collection` and store it in a transaction-level field.  Then, use `execute` to create the nft and use the `Collection`'s `deposit` function to save it in the `Collection`.

It's better practice to separate code that accesses accounts and storage to collect authorized references from the code that executes the changes to state.

:::

You can pass arguments, such as the `String` for the NFT `description` by defining parameters on the `transaction`.

Your transaction should be similar to:

```cadence
import IntermediateNFT from 0x06

transaction(description: String) {
    let receiverRef: &IntermediateNFT.Collection

    prepare(account: auth(BorrowValue) &Account) {
        self.receiverRef = account.capabilities
            .borrow<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)
            ?? panic(IntermediateNFT.collectionNotConfiguredError(address: account.address))
    }

    execute {
        let newNFT <- IntermediateNFT.mintNFT(description: description)

        self.receiverRef.deposit(token: <-newNFT)

        log("NFT Minted and deposited to minter's Collection")
    }
}
```

:::info[Action]

Test your transaction by minting several NFTs for several accounts.  Try it with accounts that do and do **not** have `Collections` and verify that the correct behavior occurs.

:::

## Printing the NFTs Owned by an Account

Remember, you can use scripts to access functionality that doesn't need authorization, such as the function to `getIDs` for all the NFTs in a `Collection`.

:::info[Action]

Write a script to `PrintNFTs` for the provided address.

:::

You can also pass arguments into the `main` function in a script.

```cadence

import IntermediateNFT from 0x06

access(all) fun main(address: Address): [UInt64] {
    let nftOwner = getAccount(address)

    let capability = nftOwner.capabilities.get<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)

    let receiverRef = nftOwner.capabilities
        .borrow<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)
        ?? panic(IntermediateNFT.collectionNotConfiguredError(address: address))


    log("Account "
      .concat(address.toString())
      .concat(" NFTs")
    )

    return receiverRef.getIDs()
}

```

## Transferring NFTs

Finally, you'll want to provide a method for users to `Transfer` NFTs to one another.  To do so, you'll need to `withdraw` the NFT from the owner's `Collection` and `deposit` it to the recipient.  

This transaction is **not** bound by the `Withdraw` capability, because the caller will be the account that has the NFT in storage, which automatically possesses full entitlement to everything in its own storage.  It also doesn't need the permission of or a signature from the recipient, because we gave the `deposit` function `access(all)` and published a public capability to it.

:::info[Action]

Start by stubbing out a transaction that accepts a `recipientAddress` and `tokenId`.  It should have a transaction-level field called `transferToken` to store the NFT temporarily, between the `prepare`, and `execute` phases. 

:::

```cadence
import IntermediateNFT from 0x06

transaction(recipientAddress: Address, tokenId: UInt64) {
    let transferToken: @IntermediateNFT.NFT

    prepare(account: auth(BorrowValue) &Account) {
        // TODO
    }

    execute {
        // TODO
    }
}
```

:::info[Action]

Next, in `prepare`, get a reference to the sender's `Collection` and use it to `move (<-)` the token out of their collection and into `transferToken`:

:::

```cadence
let collectionRef = account.storage
    .borrow<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>(from: IntermediateNFT.CollectionStoragePath)
    ?? panic(IntermediateNFT.collectionNotConfiguredError(address: account.address))

self.transferToken <- collectionRef.withdraw(withdrawID: tokenId)
```

:::info[Action]

Finally, get a public reference to the recipient's account, use that to get a reference to the capability for the recipient's `Collection`, and use the `deposit` function to `move (<-)` the NFT.

:::

```cadence
let recipient = getAccount(recipientAddress)

let receiverRef = recipient.capabilities
    .borrow<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)
    ?? panic(IntermediateNFT.collectionNotConfiguredError(address: recipient.address))

receiverRef.deposit(token: <-self.transferToken)

log("NFT ID transferred to account "
    .concat(recipient.address.toString()))
```

:::info[Action]

Test your transaction by transferring several NFTs for several accounts.  Try various combinations, and use the `PrintNFTs` script to make sure the NFTs move as expected.

:::


## Reviewing Intermediate NFTs

In this tutorial, you learned how to expand the functionality of your basic NFT to allow users to create collections of NFTs, then mint and trade those collections.  You also learned more about the details of [entitlements] and how you can use them to protect functionality so that only those who are supposed to be able to access something are able to.

Now that you have completed the tutorial, you should be able to:

* Implement a collection [resource] that can manage multiple NFTs on behalf of a user.
* Create an [entitlement] to limit some functionality of a [resource] to the owner.
* Handle errors more elegantly with functions that generate error messages.

In the next tutorial, you'll learn how to create fungible token collections.

<!-- Reference-style links, will not render on the page -->

[last tutorial]: ./05-non-fungible-tokens-1.md
[resource]: ../language/resources.mdx
[entitlement]: ../language/access-control.md
[dictionary]: ../language/values-and-types.mdx#dictionaries
[capability security]: ../language/capabilities.md
[entitlements]: ../language/access-control.md#entitlements