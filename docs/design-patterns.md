---
title: Cadence Design Patterns
sidebar_position: 5
sidebar_label: Design Patterns
---

This is a selection of software design patterns developed by core Flow developers
while writing Cadence code for deployment to Flow Mainnet.

Many of these design patters apply to most other programming languages, but some are specific to Cadence.

[Design patterns](https://en.wikipedia.org/wiki/Software_design_pattern) are building blocks for software development.
They may provide a solution to a problem that you encounter when writing smart contracts in Cadence.
If they do not clearly fit, these patterns may not be the right solution for a given situation or problem.
They are not meant to be rules to be followed strictly, especially where a better solution presents itself.

# General

These are general patterns to follow when writing smart contracts.

## Use named value fields for constants instead of hard-coding

### Problem

Your contracts, resources, and scripts all have to refer to the same value.
A number, a string, a storage path, etc.
Entering these values manually in transactions and scripts is a potential source of error.
See [Wikipedia's page on magic numbers](https://en.wikipedia.org/wiki/Magic_number_(programming))

### Solution

Add a public (`access(all)`), constant (`let`) field, e.g. a `Path` , to the contract responsible for the value,
and set it in the contract's initializer.
Refer to that value via this public field rather than specifying it manually.

Example Snippet:

```cadence

// BAD Practice: Do not hard code storage paths
access(all)
contract NamedFields {

    access(all)
    resource Test {}

    init() {
        // BAD: Hard-coded storage path
        self.account.storage.save(<-create Test(), to: /storage/testStorage)
    }
}

// GOOD practice: Instead, use a field
//
access(all)
contract NamedFields {

    access(all)
    resource Test {}

    // GOOD: field storage path
    access(all)
    let testStoragePath: StoragePath

    init() {
        // assign and access the field here and in transactions
        self.testStoragePath = /storage/testStorage
        self.account.storage.save(<-create Test(), to: self.TestStoragePath)
    }
}

```

[Example Code](https://github.com/onflow/flow-core-contracts/blob/71ea0dfe843da873d52c6a983e7c8f44a4677b26/contracts/LockedTokens.cdc#L779)

## Script-Accessible public field/function

Data availability is important in a blockchain environment.
It is useful to publicize information about your smart contract and the assets it controls
so other smart contracts and apps can easily query it.

### Problem

Your contract, resource, or struct has a field or resource that will need to be read and used on or off-chain, often in bulk.

### Solution

Make sure that the field can be accessed from a script.
This saves the time and fees required to read a property using a transaction.
Making the field or function `access(all)` and exposing it via a `/public/` capability will allow this.

Be careful not to expose any data or functionality that should be kept private when doing so.

Example:

```cadence
// BAD: Field is private, so it cannot be read by the public
access(self)
let totalSupply: UFix64

// GOOD: Field is public, so it can be read and used by anyone
access(all)
let totalSupply: UFix64
```

## Script-Accessible report

### Problem

Your contract has a resource that you wish to access fields of.
Resources are often stored in private places and are hard to access.
Additionally, scripts cannot return resources to the external context,
so a struct must be used to hold the data.

### Solution

Return a reference to a resource if the data from a single resource is all that is needed.
Otherwise, declare a struct to hold the data that you wish to return from the script.
Write a function that fills out the fields of this struct with the data
from the resource that you wish to access.
Then call this on the resource that you wish to access the fields of in a script,
and return the struct from the script.

See [Script-Accessible public field/function](#script-accessible-public-fieldfunction), above, for how best to expose this capability.

### Example

```cadence
access(all)
contract AContract {

    access(all)
    let BResourceStoragePath: StoragePath

    access(all)
    let BResourcePublicPath: PublicPath

    init() {
        self.BResourceStoragePath = /storage/BResource
        self.BResourcePublicPath = /public/BResource
    }

    // Resource definition
    access(all)
    resource BResource {

        access(all)
        var c: UInt64

        access(all)
        var d: String


        // Generate a struct with the same fields
        // to return when a script wants to see the fields of the resource
        // without having to return the actual resource
        access(all)
        fun generateReport(): BReportStruct {
            return BReportStruct(c: self.c, d: self.d)
        }

        init(c: UInt64, d: String) {
            self.c = c
            self.d = d
        }
    }

    // Define a struct with the same fields as the resource
    access(all)
    struct BReportStruct {

        access(all)
        var c: UInt64

        access(all)
        var d: String

        init(c: UInt64, d: String) {
            self.c = c
            self.d = d
        }

    }
}
...
// Transaction
import AContract from 0xAContract

transaction {
        prepare(acct: auth(IssueStorageCapabilityController, PublishCapability) &Account) {
            //...
            let cap = acct.capabilities.storage.issue<&AContract.BResource>(AContract.BResourceStoragePath)
            acct.capabilities.publish(cap, at: AContract.BResourcePublicPath)
        }
}
// Script
import AContract from 0xAContract

// Return the struct with a script
access(all)
fun main(account: Address): AContract.BReportStruct {
    // borrow the resource
    let b = getAccount(account).capabilities
        .borrow<&AContract.BResource>(AContract.BResourcePublicPath)
    // return the struct
    return b.generateReport()
}
```

## Init singleton

### Problem

An admin resource must be created and delivered to a specified account.
There should not be a function to do this, as that would allow anyone to create an admin resource.

### Solution

Create any one-off resources in the contract's initializer
and deliver them to an address or `&Account` specified as an argument.

See how this is done in the LockedTokens contract initializer:

[LockedTokens.cdc](https://github.com/onflow/flow-core-contracts/blob/71ea0dfe843da873d52c6a983e7c8f44a4677b26/contracts/LockedTokens.cdc#L765-L780)

and in the transaction that is used to deploy it:

[admin_deploy_contract.cdc](https://github.com/onflow/flow-core-contracts/blob/master/transactions/lockedTokens/admin/admin_deploy_contract.cdc)


## Use descriptive names for fields, paths, functions and variables

### Problem

Smart contracts often are vitally important pieces of a project and often have many other
smart contracts and applications that rely on them.
Therefore, they need to be clearly written and easy to understand.

### Solution

All fields, functions, types, variables, etc., need to have names that clearly describe what they are used for.

`account` / `accounts` is better than `array` / `element`.

`providerAccount` / `tokenRecipientAccount` is better than `acct1` / `acct2`.

`/storage/bestPracticesDocsCollectionPath` is better than `/storage/collection`

### Example

```cadence
// BAD: Unclear naming
//
access(all)
contract Tax {

    // Do not use abbreviations unless absolutely necessary
    access(all)
    var pcnt: UFix64

    // Not clear what the function is calculating or what the parameter should be
    access(all)
    fun calculate(num: UFix64): UFix64 {
        // What total is this referring to?
        let total = num + (num * self.pcnt)

        return total
    }
}

// GOOD: Clear naming
//
access(all)
contract TaxUtilities {

    // Clearly states what the field is for
    access(all)
    var taxPercentage: UFix64

    // Clearly states that this function calculates the
    // total cost after tax
    access(all)
    fun calculateTotalCostPlusTax(preTaxCost: UFix64): UFix64 {
        let postTaxCost = preTaxCost + (preTaxCost * self.taxPercentage)

        return postTaxCost
    }
}
```

## Plural names for arrays and maps are preferable

For example, use `accounts` rather than `account` for an array of accounts.

This signals that the field or variable is not scalar.
It also makes it easier to use the singular form for a variable name during iteration.

## Use transaction post-conditions when applicable

### Problem

Transactions can contain any amount of valid Cadence code and access many contracts and accounts.
The power of resources and capabilities means that there may be some behaviors of programs that are not expected.

### Solution

It is usually safe to include post-conditions in transactions to verify the intended outcome.

### Example

This could be used when purchasing an NFT to verify that the NFT was deposited in your account's collection.

```cadence
// Pseudo-code

transaction {

    access(all)
    let buyerCollectionRef: &NonFungibleToken.Collection

    prepare(acct: auth(BorrowValue) &Account) {

        // Get tokens to buy and a collection to deposit the bought NFT to
        let temporaryVault <- vaultRef.withdraw(amount: 10.0)
        let self.buyerCollectionRef = acct.storage.borrow(from: /storage/Collection)

        // purchase, supplying the buyers collection reference
        saleRef.purchase(tokenID: 1, recipient: self.buyerCollectionRef, buyTokens: <-temporaryVault)

    }
    post {
        // verify that the buyer now owns the NFT
        self.buyerCollectionRef.idExists(1) == true: "Bought NFT ID was not deposited into the buyers collection"
    }
}
```

## Avoid unnecessary load and save storage operations, prefer in-place mutations

### Problem

When modifying data in account storage, `load()` and `save()` are costly operations:
All data is unnecessarily moved out of the account, then moved back into the account.
This can quickly cause your transaction to reach its limits.

This also applies to nested, stored in fields, arrays, and dictionaries:
Moving objects out of containers and moving them back into the container,
just to modify the object, is just as costly.

For example, a collection contains a dictionary of NFTs.
There is no need to move the whole dictionary out of the field,
update the dictionary on the stack (e.g., adding or removing an NFT),
and then move the whole dictionary back to the field:
the dictionary can be updated in-place, which is easier and more efficient.
The same goes for a more complex data structure like a dictionary of nested resources:
Each resource can be updated in-place by taking a reference to the nested object instead of loading and saving.

### Solution

For making modifications to values in storage or accessing stored objects,
`borrow()` should always be used to access them instead of `load` or `save` unless absolutely necessary.
`borrow()` returns a reference to the object at the storage path instead of having to load the entire object.
This reference can be assigned to or can be used to access fields or call methods on stored objects.

Fields and value in containers, such as in arrays and dictionaries,
can be borrowed using a reference expression (`&v as &T`).

### Example

```cadence
// BAD: Loads and stores a resource to use it
//
transaction {

    prepare(acct: auth(LoadValue, SaveValue) &Account) {

        // Removes the vault from storage, a costly operation
        let vault <- acct.storage.load<@ExampleToken.Vault>(from: /storage/exampleToken)

        // Withdraws tokens
        let burnVault <- vault.withdraw(amount: 10)

        destroy burnVault

        // Saves the used vault back to storage, another costly operation
        acct.storage.save(to: /storage/exampleToken)

    }
}

// GOOD: Uses borrow instead to avoid costly operations
//
transaction {

    prepare(acct: auth(BorrowValue) &Account) {

        // Borrows a reference to the stored vault, much less costly operation
        let vault <- acct.storage.borrow<&ExampleToken.Vault>(from: /storage/exampleToken)

        let burnVault <- vault.withdraw(amount: 10)

        destroy burnVault

        // No `save` required because we only used a reference
    }
}
```

# Capabilities

## Capability bootstrapping

### Problem

An account must be given a [capability](./language/capabilities.md) to an object stored in another account.
To create (issue) the capability, the transaction must be signed by a key which has access to the target account.

To transfer / deliver the capability to the other account, the transaction also needs write access to that one.
It is not as easy to produce a single transaction which is authorized by two accounts
as it is to produce a typical transaction which is authorized by one account.

This prevents a single transaction from fetching the capability
from one account and delivering it to the other.

### Solution

The solution to the bootstrapping problem in Cadence is provided by the
[Inbox API](./language/accounts/inbox.mdx).

Account A (which we will call the provider) creates the capability they wish to send to account B
(which we will call the recipient),
and stores this capability on their account in a place where the recipient can access it
using the `Inbox.publish` function on their account.
They choose a name for the capability that the recipient can later use to identify it,
and specify the recipient's address when calling `publish`.
This call to `publish` will emit an `InboxValuePublished` event
that the recipient can listen for off-chain to know that the Capability is ready for them to claim.

The recipient then later can use the `Inbox.claim` function to securely claim the capability
from the provider's account.
They must provide the name and type with which the capability was published,
as well as the address of the provider's account
(all of this information is available in the `InboxValuePublished` event emitted on `publish`).
This will remove the capability from the provider's account and emit an `InboxValueClaimed` event
that the provider can listen for off-chain.

One important caveat to this is that the published capability is stored on the provider's account
until the recipient claims it,
so the provider can also use the `Inbox.unpublish` function to remove the capability from their account
if they no longer wish to pay for storage for it.
This also requires the name and type which the capability was published,
and emits an `InboxValueUnpublished` event that the recipient can listen for off-chain.

It is also important to note that the recipient becomes the owner of the capability object
once they have claimed it, and can thus store it or copy it anywhere they have access to.
This means providers should only publish capabilities to recipients they trust to use them properly,
or limit the type with which the capability is authorized
in order to only give recipients access to the functionality
that the provider is willing to allow them to copy.

```cadence
import "BasicNFT"

transaction(receiver: Address, name: String) {

    prepare(signer: auth(IssueStorageCapabilityController, PublishInboxCapability) &Account) {

        // Issue a capability controller for the storage path
        let capability = signer.capabilities.storage.issue<&BasicNFT.Minter>(BasicNFT.minterPath)

        // Set the name as tag so it is easy for us to remember its purpose
        let controller = signer.capabilities.storage.getController(byCapabilityID: capability.id)
                ?? panic("Cannot get the storage capability controller with ID "
                    .concat(capabilityID.toString())
                    .concat(" from the signer's account! Make sure the ID belongs to a capability that the owner controls and that it is a storage capability.")
        controller.setTag(name)

        // Publish the capability, so it can be later claimed by the receiver
        signer.inbox.publish(capability, name: name, recipient: receiver)
    }
}
```

```cadence
import "BasicNFT"

transaction(provider: Address, name: String) {

    prepare(signer: auth(ClaimInboxCapability, SaveValue) &Account) {

        // Claim the capability from our inbox
        let capability = signer.inbox.claim<&BasicNFT.Minter>(name, provider: provider)
                ?? panic("Cannot claim the storage capability controller with name "
                    .concat(name).concat(" from the provider account (").concat(provider.toString())
                    .concat("! Make sure the provider address is correct and that they have published "
                    .concat(" a capability with the desired name.")

        // Save the capability to our storage so we can later retrieve and use it
        signer.storage.save(capability, to: BasicNFT.minterPath)
    }
}
```

## Check for existing capability before publishing new one

### Problem

When publishing a capability, a capability might be already be published at the specified path.

### Solution

Check if a capability is already published at the given path.

### Example

```cadence
transaction {
    prepare(signer: auth(Capabilities) &Account) {
        let capability = signer.capabilities.storage
            .issue<&ExampleToken.Vault>(/storage/exampleTokenVault)

        let publicPath = /public/exampleTokenReceiver

        if signer.capabilities.exits(publicPath) {
            signer.capabilities.unpublish(publicPath)
        }
        signer.capabilities.publish(capability, at: publicPath)
    }
}
```

## Capability Revocation

### Problem

A capability provided by one account to a second account must able to be revoked
by the first account without the co-operation of the second.

### Solution

If the capability is a storage capability:

```cadence
transaction(capabilityID: UInt64) {
    prepare(signer: auth(StorageCapabilities) &Account) {
        let controller = signer.capabilities.storage
            .getController(byCapabilityID: capabilityID)
            ?? panic("Cannot get the storage capability controller with ID "
                    .concat(capabilityID.toString())
                    .concat(" from the signer's account! Make sure the ID belongs to a capability that the owner controls and that it is a storage capability.")
        controller.delete()
    }
}
```

If the capability is an account capability:

```cadence
transaction(capabilityID: UInt64) {
    prepare(signer: auth(AccountCapabilities) &Account) {
        let controller = signer.capabilities.account
            .getController(byCapabilityID: capabilityID)
            ?? panic("Cannot get the account capability controller with ID "
                    .concat(capabilityID.toString())
                    .concat(" from the signer's account! Make sure the ID belongs to a capability that the owner controls and that it is an account capability.")
        controller.delete()
    }
}
```
