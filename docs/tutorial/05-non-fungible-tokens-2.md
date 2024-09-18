---
archived: false
draft: false
title: 5.2 Non-Fungible Token Tutorial Part 2
description: An introduction to NFTs in Cadence
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
tags:
  - reference
  - NFT
  - Non-Fungible Token
  - cadence
  - tutorial
socialImageTitle: Non-Fungible Tokens in Cadence
socialImageDescription: NFT social image.
---

In this tutorial, we're going to learn about
a full implementation for **Non-Fungible Tokens (NFTs)**.

---

<Callout type="success">
  Open the starter code for this tutorial in the Flow Playground:
  <a
    href="https://play.flow.com/63d827b3-0b49-48d5-91ba-4b222c23e217"
    target="_blank"
  >
    https://play.flow.com/63d827b3-0b49-48d5-91ba-4b222c23e217
  </a>
  The tutorial will ask you to take various actions to interact with this code.
</Callout>

<Callout type="info">
Instructions that require you to take action are always included in a callout box like this one.
These highlighted actions are all that you need to do to get your code running,
but reading the rest is necessary to understand the language's design.
</Callout>


## Storing Multiple NFTs in a Collection

In the [last tutorial](./05-non-fungible-tokens-1.md),
we created a simple `NFT` resource, stored in at a storage path,
then used a multi-sig transaction to transfer it from one account to another.

It should hopefully be clear that the setup and operations that we used
in the previous tutorial are not very scalable. Users need a way
to manage all of their NFTs from a single place.

There are some different ways we could accomplish this.

* We could store all of our NFTs in an array or dictionary, like so.
```cadence
// Define a dictionary to store the NFTs in
let myNFTs: @{Int: BasicNFT.NFT} = {}

// Create a new NFT
let newNFT <- BasicNFT.createNFT(id: 1)

// Save the new NFT to the dictionary
myNFTs[newNFT.id] <- newNFT

// Save the NFT to a new storage path
account.storage.save(<-myNFTs, to: /storage/basicNFTDictionary)

```

## Dictionaries

This example uses a [**Dictionary**: a mutable, unordered collection of key-value associations](../language/values-and-types.mdx#dictionaries).

```cadence
// Keys are `Int`
// Values are `NFT`
access(all) let myNFTs: @{Int: NFT}
```

In a dictionary, all keys must have the same type, and all values must have the same type.
In this case, we are mapping integer (`Int`) IDs to `NFT` resource objects
so that there is one `NFT` for each `Int` that exists in the dictionary.

Dictionary definitions don't usually have the `@` symbol in the type specification,
but because the `myNFTs` mapping stores resources, the whole field also has to become a resource type,
which is why the field has the `@` symbol indicating that it is a resource type.

This means that all the rules that apply to resources apply to this type.

Using a dictionary to store our NFTs would solve the problem
of having to use different storage paths for each NFT, but it doesn't solve all the problems.
These types are relatively opaque and don't have much useful functionality on their own.

Instead, we can use a powerful feature of Cadence, resources owning other resources!
We'll define a new `Collection` resource as our NFT storage place
to enable more-sophisticated ways to interact with our NFTs.

The next contract we look at is called `ExampleNFT`, it's stored in Contract 1 in account `0x06`.

This contract expands on the `BasicNFT` we looked at by adding:
1. An `idCount` contract field that tracks unique NFT ids.
2. An `NFTReceiver` interface that specifies three public functions for the collection.
3. Declares a resource called `Collection` that acts as a place to intuitively store and manage
   your NFTs. It implements the `NFTReceiver` interface
4. The `Collection` will declare fields and functions to interact with it,
   including `ownedNFTs`, `init()`, `withdraw()`, and other important functions
5. Next, the contract declares functions that create a new NFT (`mintNFT()`)
   and an empty collection (`createEmptyCollection()`)
7. Finally, the contract declares an initializer that initializes the path fields,
   creates an empty collection as well as a reference to it,
   and saves a minter resource to account storage.

This contract introduces a few new concepts, we'll look at the new contract, then break down all the new
concepts this contract introduces.

<Callout type="info">

Open the `ExampleNFT` contract.<br/>
Deploy the contract by clicking the Deploy button in the bottom right of the editor.<br/>
`ExampleNFT.cdc` should contain the code below.
It contains what was already in `BasicNFT.cdc` plus additional resource declarations in the contract body.

</Callout>

```cadence ExampleNFT.cdc
/// ExampleNFT.cdc
///
/// This is a complete version of the ExampleNFT contract
/// that includes withdraw and deposit functionalities, as well as a
/// collection resource that can be used to bundle NFTs together.
///
/// Learn more about non-fungible tokens in this tutorial: https://developers.flow.com/cadence/tutorial/non-fungible-tokens-1

access(all) contract ExampleNFT {

    // Declare Path constants so paths do not have to be hardcoded
    // in transactions and scripts

    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath
    access(all) let MinterStoragePath: StoragePath

    // Tracks the unique IDs of the NFTs
    access(all) var idCount: UInt64

    // Declare the NFT resource type
    access(all) resource NFT {
        // The unique ID that differentiates each NFT
        access(all) let id: UInt64

        // Initialize both fields in the initializer
        init(initID: UInt64) {
            self.id = initID
        }
    }

    access(all) entitlement Withdraw

    // The definition of the Collection resource that
    // holds the NFTs that a user owns
    access(all) resource Collection {
        // dictionary of NFT conforming tokens
        // NFT is a resource type with an `UInt64` ID field
        access(all) var ownedNFTs: @{UInt64: NFT}

        // Initialize the NFTs field to an empty collection
        init () {
            self.ownedNFTs <- {}
        }

        // withdraw
        //
        // Function that removes an NFT from the collection
        // and moves it to the calling context
        access(Withdraw) fun withdraw(withdrawID: UInt64): @NFT {
            // If the NFT isn't found, the transaction panics and reverts
            let token <- self.ownedNFTs.remove(key: withdrawID)
                ?? panic("Could not withdraw an ExampleNFT.NFT with id="
                          .concat(withdrawID.toString())
                          .concat("Verify that the collection owns the NFT ")
                          .concat("with the specified ID first before withdrawing it."))

            return <-token
        }

        // deposit
        //
        // Function that takes a NFT as an argument and
        // adds it to the collections dictionary
        access(all) fun deposit(token: @NFT) {
            // add the new token to the dictionary with a force assignment
            // if there is already a value at that key, it will fail and revert
            self.ownedNFTs[token.id] <-! token
        }

        // idExists checks to see if a NFT
        // with the given ID exists in the collection
        access(all) view fun idExists(id: UInt64): Bool {
            return self.ownedNFTs[id] != nil
        }

        // getIDs returns an array of the IDs that are in the collection
        access(all) view fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }
    }

    // creates a new empty Collection resource and returns it
    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    // mintNFT
    //
    // Function that mints a new NFT with a new ID
    // and returns it to the caller
    access(all) fun mintNFT(): @NFT {

        // create a new NFT
        var newNFT <- create NFT(initID: self.idCount)

        // change the id so that each ID is unique
        self.idCount = self.idCount + 1

        return <-newNFT
    }

	init() {
        self.CollectionStoragePath = /storage/nftTutorialCollection
        self.CollectionPublicPath = /public/nftTutorialCollection
        self.MinterStoragePath = /storage/nftTutorialMinter

        // initialize the ID count to one
        self.idCount = 1

        // store an empty NFT Collection in account storage
        self.account.storage.save(<-self.createEmptyCollection(), to: self.CollectionStoragePath)

        // publish a capability to the Collection in storage
        let cap = self.account.capabilities.storage.issue<&Collection>(self.CollectionStoragePath)
        self.account.capabilities.publish(cap, at: self.CollectionPublicPath)
	}
}
```

This smart contract more closely resembles a contract
that a project would actually use in production, but still does not use the official NFT standard,
so it should not be used in any production code.

Any user who owns one or more `ExampleNFT` should have an instance
of this `@ExampleNFT.Collection` resource stored in their account.
This collection stores all of their NFTs in a dictionary that maps integer IDs to `@NFT`s.

Each collection has a `deposit` and `withdraw` function.
These functions allow users to follow the pattern of moving tokens in and out of
their collections through a standard set of functions.

When a user wants to store NFTs in their account,
they will create an empty `Collection` by calling the `createEmptyCollection()` function in the `ExampleNFT` smart contract.
This returns an empty `Collection` object that they can store in their account storage.

There are a few new features that we use in this example, so let's walk through them.

## The Resource Dictionary

We discussed above that when a dictionary stores a resource, it also becomes a resource!

This means that the collection has to have special rules for how to handle its own resource.
You wouldn't want it getting lost by accident!

As we learned in the resource tutorial, you can destroy any resource
by explicitly invoking the `destroy` command.

When the NFT `Collection` resource is destroyed with the `destroy` command,
all the resources stored in the dictionary are also `destroy`ed.

When the `Collection` resource is created, the initializer is run
and must explicitly initialize all member variables.
This helps prevent issues in some smart contracts where uninitialized fields can cause bugs.
The initializer can never run again after this.
Here, we initialize the dictionary as a resource type with an empty dictionary.

```cadence
init () {
  self.ownedNFTs <- {}
}
```

Another feature for dictionaries is the ability to get an array
of the keys of the dictionary using the built-in `keys` function.

```cadence
// getIDs returns an array of the IDs that are in the collection
access(all) view fun getIDs(): [UInt64] {
    return self.ownedNFTs.keys
}
```

This can be used to iterate through the dictionary or just to see a list of what is stored.
As you can see, [a variable length array type](../language/values-and-types.mdx#arrays)
is declared by enclosing the member type within square brackets (`[UInt64]`).

## Resources Owning Resources

This NFT Collection example in `ExampleNFT.cdc` illustrates an important feature: resources can own other resources.

In the example, a user can transfer one NFT to another user.
Additionally, since the `Collection` explicitly owns the NFTs in it,
the owner could transfer all of the NFTs at once by just transferring the single collection.

This is an important feature because it enables numerous additional use cases.
In addition to allowing easy batch transfers,
this means that if a unique NFT wants to own another unique NFT,
like a CryptoKitty owning a hat accessory,
the Kitty literally stores the hat in its own fields and effectively owns it.
The hat belongs to the CryptoKitty that it is stored in,
and the hat can be transferred separately or along with the CryptoKitty that owns it.

This also brings up an interesting wrinkle in Cadence in regards to ownership.
In other ledger-based languages, ownership is indicated by account addresses.
Cadence is a fully object-oriented language, so ownership is indicated by where
an object is stored, not just an entry on a ledger.

Resources can own other resources, which means that with some interesting logic,
a resource can have more control over the resources it owns than the actual
person whose account it is stored in!

You'll encounter more fascinating implications of ownership and interoperability
like this as you get deeper into Cadence.

Now, back to the tutorial!

## Restricting Access to the NFT Collection

In the NFT Collection, we will publish a capability to allow anyone
to access important functionality for our `Collection`, like `deposit()` and `getIDs()`.

This is where an important layer of access control comes in.
Cadence utilizes [capability security](../language/capabilities.md),
which means that for any given object, a user is allowed to access a field or method of that object if they either:

- Are the owner of the object
- Have a valid reference to that field or method (note that references can only be created from capabilities, and capabilities can only be created by the owner of the object)

When a user stores their NFT `Collection` in their account storage,
it is by default not available for other users to access
because it requires access to the authorized account object (`auth(Storage) &Account`)
which is only accessible by a transaction that the owner authorizes and signs.

To give external accounts access to the `access(all)` fields and functions, 
the owner creates a link to the object in storage.

This link creates a capability. From there, the owner can then do whatever they want with that capability:
they could pass it as a parameter to a function for one-time-use,
or they could put in the `/public/` domain of their account so that anyone can access it.

The creation and publishing of the capability is seen
in the `ExampleNFT.cdc` contract initializer.

```cadence
// publish a capability to the Collection in storage
let cap = self.account.capabilities.storage.issue<&Collection>(self.CollectionStoragePath)
self.account.capabilities.publish(cap, at: self.CollectionPublicPath)
```

The `issue` function specifies that the capability is typed as `&Collection`.
Then the link is published to `/public/` which is accessible by anyone.
The link targets the `/storage/NFTCollection` (through the `self.CollectionStoragePath` contract field) that we created earlier.

Now the user has an NFT collection in their account `/storage/`,
along with a capability for it that others can use to see what NFTs they own and to send an NFT to them.

Let's confirm this is true by running a script!

## Run a Script

---

Scripts in Cadence are simple transactions that run without any account permissions and only read information from the blockchain.

<Callout type="info">

Open the script file named `Print 0x06 NFTs`.
`Print 0x06 NFTs` should contain the following code:

</Callout>

```cadence
import ExampleNFT from 0x06

// Print the NFTs owned by account 0x06.
access(all) fun main(): [UInt64] {
    // Get the public account object for account 0x06
    let nftOwner = getAccount(0x06)

    // Find the public Receiver capability for their Collection and borrow it
    let receiverRef = nftOwner.capabilities
        .borrow<&ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)
        ?? panic("Could not borrow a receiver reference to 0x06's ExampleNFT.Collection"
                 .concat(" from the path ")
                 .concat(ExampleNFT.CollectionPublicPath.toString())
                 .concat(". Make sure account 0x06 has set up its account ")
                 .concat("with an ExampleNFT Collection."))

    // Log the NFTs that they own as an array of IDs
    log("Account 1 NFTs")
    return receiverRef.getIDs()
}
```

<Callout type="info">

Execute `Print 0x06 NFTs` by clicking the Execute button in the top right of the editor box.<br/>
This script returns a list of the NFTs that account `0x06` owns.

</Callout>

Because account `0x06` currently doesn't own any in its collection, it will just print an empty array:

```
"Account 1 NFTs"
Result > []
```

If the script cannot be executed, it probably means that the NFT collection hasn't been stored correctly in account `0x06`.
If you run into issues, make sure that you deployed the contract in account `0x06` and that you followed the previous steps correctly.

## Using Entitlements

We do not want everyone in the network to be able to call our `withdraw` function though.
In Cadence, any reference can be freely up-casted or down-casted to any subtype or supertype
that the reference conforms to. This means that if I had a reference of the type
`&ExampleNFT.Collection`, this would expose all the `access(all)` functions on the `Collection`. 

This is a powerful feature that is very useful, but developers need to understand that
this means that if there is any privileged functionality on a resource that has a
public capability, then this functionality cannot be `access(all)`.
It needs to use [Entitlements](../language/access-control#entitlements).

Entitlements enable authors to restrict the scope of access 
at a granular level with the option to group restrictions 
under similarly name entitlements. Owners of resources can then 
use these entitlements to grant access to the subset of actions 
enabled by the authorized reference.

As you can see in our NFT contract, we've added an entitlement:
```cadence
access(all) entitlement Withdraw
```

We also added this entitlement to the `withdraw()` method:
```cadence
access(Withdraw) fun withdraw(withdrawID: UInt64): @NFT {
```

A function with entitled access means that that function is callable by someone
with a concrete object of the containing type as if it were `access(all)`,
but it is not callable from a regular reference to that object.
So if I borrowed a public reference to the `Collection` above of the type `&ExampleNFT.Collection`,
I could call every function and access every field on it except the `withdraw()` function.
```cadence
// Get the public capability and borrow a reference from it
let collectionRef = recipient.capabilities
    .borrow<&ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)
    ?? panic("Could not borrow a reference to the ExampleNFT.Collection")

// Try to withdraw an NFT from their collection
// ERROR: The reference is not entitled, so this call is not possible and will FAIL
let stolenNFT <- collectionRef.withdraw(withdrawID: 1)
```

In order to access an **entitled field or function** through a reference,
the reference needs to also be **entitled**. This means that when
the reference or capability is created, the owner of that object
has to explicitly specify that is has that entitlement.

The owner of an object is the only one who can create an entitled capability or reference.
In the above example, if you wanted to make your withdraw function publicly accessible,
you would issue the capability as an entitled capability
by specifying all the entitlements in the capability's type specification
using the `auth` keyword:
```cadence
// publish an entitled capability to the Collection in storage
// This capability is issued with the `auth(ExampleNFT.Withdraw)` entitlement
// This gives access to the withdraw function
let cap = self.account.capabilities.storage.issue<auth(ExampleNFT.Withdraw) &ExampleNFT.Collection>(self.CollectionStoragePath)
self.account.capabilities.publish(cap, at: self.CollectionPublicPath)
```

Now, anyone could borrow that capability as the entitled version it was issued as:
```cadence
// Get the public entitled capability and borrow a reference from it
let entitledCollectionRef = recipient.capabilities
    .borrow<auth(ExampleNFT.Withdraw) &ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)
    ?? panic("Could not borrow a reference to the ExampleNFT.Collection")

// Try to withdraw an NFT from their collection
// This will succeed because the reference is entitled
let stolenNFT <- entitledCollectionRef.withdraw(withdrawID: 1)
```

Obviously, you would not want to create a public entitled reference like this
because you don't want anyone accessing your withdraw function. 
Entitlements are primarily meant for sharing private capabilities with small subsets
of trusted users or smart contracts and should never be used for public capabilities.

The most important thing to remember is, if you don't want everyone in the network
to be able to access a function on a resource, you should default
put an entitlement on that function. Better to be safe than sorry. 

## Mint and Distribute Tokens

---

One way to create NFTs is by having an admin mint new tokens and send them to a user.
For the purpose of learning, we are simply implementing minting as a public function here.
Normally, most would implement restricted minting by having an NFT Minter resource.
This would restrict minting, because the owner of this resource is the only one that can mint tokens.

You can see an example of this in the [Marketplace tutorial](./08-marketplace-compose.md).

<Callout type="info">

Open the file named `Mint NFT`.
Select account `0x06` as the only signer and send the transaction.<br/>
This transaction deposits the minted NFT into the account owner's NFT collection:

</Callout>

```cadence mint_nft.cdc
import ExampleNFT from 0x06

// This transaction allows the Minter account to mint an NFT
// and deposit it into its own collection.

transaction {

    // The reference to the collection that will be receiving the NFT
    let receiverRef: &ExampleNFT.Collection

    prepare(acct: auth(BorrowValue) &Account) {
        // Get the owner's collection capability and borrow a reference
        self.receiverRef = acct.capabilities
            .borrow<&ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)
            ?? panic("Could not borrow a collection reference to 0x06's ExampleNFT.Collection"
                     .concat(" from the path ")
                     .concat(ExampleNFT.CollectionPublicPath.toString())
                     .concat(". Make sure account 0x06 has set up its account ")
                     .concat("with an ExampleNFT Collection."))
    }

    execute {
        // Use the minter reference to mint an NFT, which deposits
        // the NFT into the collection that is sent as a parameter.
        let newNFT <- ExampleNFT.mintNFT()

        self.receiverRef.deposit(token: <-newNFT)

        log("NFT Minted and deposited to Account 0x06's Collection")
    }
}
```

<Callout type="info">

Reopen `Print 0x06 NFTs` and execute the script.
This prints a list of the NFTs that account `0x06` owns.

</Callout>

```cadence print_06_nfts.cdc
import ExampleNFT from 0x06

// Print the NFTs owned by account 0x06.
access(all) fun main(): [UInt64] {
    // Get the public account object for account 0x06
    let nftOwner = getAccount(0x06)

    // Find the public Receiver capability for their Collection
    let capability = nftOwner.capabilities.get<&ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)

    // borrow a reference from the capability
    let receiverRef = capability.borrow()
        ?? panic("Could not borrow a receiver reference to 0x06's ExampleNFT.Collection"
                 .concat(" from the path ")
                 .concat(ExampleNFT.CollectionPublicPath.toString())
                 .concat(". Make sure account 0x06 has set up its account ")
                 .concat("with an ExampleNFT Collection."))

    // Log the NFTs that they own as an array of IDs
    log("Account 0x06 NFTs")
    return receiverRef.getIDs()
}
```

You should see that account `0x06` owns the NFT with `id = 1`

```
"Account 0x06 NFTs"
[1]
```

## Transferring an NFT

Before we are able to transfer an NFT to another account, we need to set up that account
with an NFTCollection of their own so they are able to receive NFTs.

<Callout type="info">

Open the file named `Setup Account` and submit the transaction, using account `0x07` as the only signer.

</Callout>

```cadence SetupAccount.cdc
import ExampleNFT from 0x06

// This transaction configures a user's account
// to use the NFT contract by creating a new empty collection,
// storing it in their account storage, and publishing a capability
transaction {
    prepare(acct: auth(SaveValue, Capabilities) &Account) {

        // Create a new empty collection
        let collection <- ExampleNFT.createEmptyCollection()

        // store the empty NFT Collection in account storage
        acct.storage.save(<-collection, to: ExampleNFT.CollectionStoragePath)

        log("Collection created for account 0x07")

        // create a public capability for the Collection
        let cap = acct.capabilities.storage.issue<&ExampleNFT.Collection>(ExampleNFT.CollectionStoragePath)
        acct.capabilities.publish(cap, at: ExampleNFT.CollectionPublicPath)

        log("Capability created")
    }
}
```

Account `0x07` should now have an empty `Collection` resource stored in its account storage.
It has also created and stored a capability to the collection in its `/public/` domain.

<Callout type="info">

Open the file named `Transfer`, select account `0x06` as the only signer, and send the transaction.<br/>
This transaction transfers a token from account `0x06` to account `0x07`.

</Callout>

```cadence transfer_nft.cdc
import ExampleNFT from 0x06

// This transaction transfers an NFT from one user's collection
// to another user's collection.
transaction {

    // The field that will hold the NFT as it is being
    // transferred to the other account
    let transferToken: @ExampleNFT.NFT

    prepare(acct: auth(BorrowValue) &Account) {

        // Borrow a reference from the stored collection
        let collectionRef = acct.storage
            .borrow<auth(ExampleNFT.Withdraw) &ExampleNFT.Collection>(from: ExampleNFT.CollectionStoragePath)
            ?? panic("Could not borrow a collection reference to 0x06's ExampleNFT.Collection"
                     .concat(" from the path ")
                     .concat(ExampleNFT.CollectionPublicPath.toString())
                     .concat(". Make sure account 0x06 has set up its account ")
                     .concat("with an ExampleNFT Collection."))

        // Call the withdraw function on the sender's Collection
        // to move the NFT out of the collection
        self.transferToken <- collectionRef.withdraw(withdrawID: 1)
    }

    execute {
        // Get the recipient's public account object
        let recipient = getAccount(0x07)

        // Get the Collection reference for the receiver
        // getting the public capability and borrowing a reference from it
        let receiverRef = recipient.capabilities
            .borrow<&ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)
            ?? panic("Could not borrow a collection reference to 0x07's ExampleNFT.Collection"
                     .concat(" from the path ")
                     .concat(ExampleNFT.CollectionPublicPath.toString())
                     .concat(". Make sure account 0x07 has set up its account ")
                     .concat("with an ExampleNFT Collection."))

        // Deposit the NFT in the receivers collection
        receiverRef.deposit(token: <-self.transferToken)

        log("NFT ID 1 transferred from account 0x06 to account 0x07")
    }
}
```
See, with the use of Collections and capabilities, now the only account
that needs to sign a transaction to transfer a token is the one who is sending the token.

Now we can check both accounts' collections to make sure that account `0x07` owns the token and account `0x06` has nothing.

<Callout type="info">

Execute the script `Print all NFTs` to see the tokens in each account:

</Callout>

```cadence print_all_owned_nfts.cdc
import ExampleNFT from 0x06

// Print the NFTs owned by accounts 0x06 and 0x07.
access(all) fun main() {

    // Get both public account objects
    let account6 = getAccount(0x06)
	let account7 = getAccount(0x07)

    // Find the public Receiver capability for their Collections
    let acct6Capability = account6.capabilities.get<&ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)
    let acct7Capability = account7.capabilities.get<&ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)

    // borrow references from the capabilities
    let receiver6Ref = acct6Capability.borrow()
        ?? panic("Could not borrow a collection reference to 0x06's ExampleNFT.Collection"
                 .concat(" from the path ")
                 .concat(ExampleNFT.CollectionPublicPath.toString())
                 .concat(". Make sure account 0x06 has set up its account ")
                 .concat("with an ExampleNFT Collection."))

    let receiver7Ref = acct7Capability.borrow()
        ?? panic("Could not borrow a collection reference to 0x07's ExampleNFT.Collection"
                 .concat(" from the path ")
                 .concat(ExampleNFT.CollectionPublicPath.toString())
                 .concat(". Make sure account 0x07 has set up its account ")
                 .concat("with an ExampleNFT Collection."))

    // Print both collections as arrays of IDs
    log("Account 0x06 NFTs")
    log(receiver6Ref.getIDs())

    log("Account 0x07 NFTs")
    log(receiver7Ref.getIDs())
}
```

You should see something like this in the output:

```
"Account 0x06 NFTs"
[]
"Account 0x07 NFTs"
[1]
```

Account `0x07` has one NFT with ID=1 and account `0x06` has none.
This shows that the NFT was transferred from account `0x06` to account `0x07`.

<img src="https://storage.googleapis.com/flow-resources/documentation-assets/cadence-tuts/accounts-nft-storage.png" />

Congratulations, you now have a working NFT!

## Putting It All Together

---

This was only a basic example how a NFT might work on Flow.
Please refer to the [Flow NFT Standard repo](https://github.com/onflow/flow-nft)
and the [NFT Developer Guide](https://developers.flow.com/build/guides/nft)
for information about the official Flow NFT standard and how to implement
a real version of an NFT smart contract.

## Fungible Tokens

---

Now that you have a working NFT, you will probably want to be able to trade it. For that you are going to need to
understand how fungible tokens work on Flow, so go ahead and move to the next tutorial!
