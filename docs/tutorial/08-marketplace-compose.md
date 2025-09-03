---
title: Marketplace
archived: false
draft: false
description: Build a composable NFT marketplace on Flow using Cadence, integrating fungible and non-fungible tokens, capabilities, and events.
date: 2024-06-13
meta:
  keywords:
    - tutorial
    - Flow
    - Cadence
    - NFT
    - Marketplace
    - Fungible Token
    - Non-Fungible Token
    - Resources
    - Capabilities
    - Events
tags:
  - reference
  - NFT
  - Marketplace
  - cadence
  - tutorial
---

In this tutorial, we're going to create a simplified marketplace that uses both the fungible and non-fungible token (NFT) contracts that we built in previous tutorials.

:::warning

This tutorial uses the simplified fungible and non-fungible tokens you built in this series. It is not suitable for production. If you're ready to build or work with a production-quality marketplace, check out the [NFT storefront repo]. This contract is already deployed to testnet and mainnet and can be used by anyone for any generic NFT sale!

:::

Marketplaces are a popular application of blockchain technology and smart contracts. People with digital collectibles such as NFTs need to be able to buy and sell them — either with the network token or their fungible tokens.

More than just a convenience, marketplaces demonstrate one of the most compelling arguments for developing digital property on blockchains. In web 2, each developer needed to build their own bespoke systems for buying, selling, trading, and storing digital property. Onchain, if you build digital property that adheres to the appropriate standards, your digital collectibles, items, etc., will **automatically appear on several marketplace apps** built by experts in marketplaces who have made them the focus of their attention and business.

## Objectives

After completing this tutorial, you'll be able to:

- Construct an NFT marketplace that allows users to buy and sell NFTs in exchange for $FLOW or your fungible token.
- Utilize [interfaces], [resources], and [capabilities] to write composable code that takes advantage of resources built by others and allows others to build on your products.
- Construct and emit [events] to share contract actions and states with other apps and services

## Prerequisites

To complete this tutorial, you must have completed the [Marketplace Setup Tutorial]. If you need to, you can start from the [Setup Reference Solution], but you'll need to follow the [Marketplace Setup Tutorial] to deploy the contracts and call the setup transactions.

## Building with composability

Now that **there are** contracts deployed for both fungible and non-fungible tokens, we can build a marketplace that uses both. We've picked the words _there are_ in the prior sentence on purpose. It doesn't matter that you created these contracts. If they were deployed onchain, instead of in the ephemeral simulation in the playground, **anyone** could complete this tutorial to build a marketplace that works with your NFTs and tokens.

It's one of the most powerful and useful properties of building onchain and it's called _composability_ — the ability for developers to leverage shared resources, such as code, digital property, and user bases, and use them as building blocks for a new application.

This isn't an entirely new concept — we're used to reusing code, open source projects, etc. But the degree and scale are much higher. For example, if you're building an onchain version of a web forum, you don't need to do anything to allow your users to have a profile picture beyond allowing them to select which PFP they own from the list of PFP collections you choose to incorporate into your app.

You're happy because you get a solution that works for your users for minimal effort, and the PFP collection creator is happy because their work becomes more valuable and desirable the more places it can be used an seen. Everybody wins!

Flow is designed to enable composability through interfaces, resources and capabilities:

- [Interfaces] allow projects to support any generic type as long as it supports a standard set of functionality specified by an interface.
- [Resources] can be passed around and owned by accounts, contracts or even other resources, unlocking different use cases depending on where the resource is stored.
- [Capabilities] allow exposing user-controlled sets of functionality and permissions through special objects that enforce strict security with Cadence's type system.

The combination of these features allow developers to do more with less, re-using known safe code and design patterns to create new, powerful, and unique interactions!

## Building a marketplace

To create a marketplace, we need to integrate the functionality of both fungible and non-fungible tokens into a single contract that gives users control over their money and assets. To accomplish this, we'll create a composable smart contract.

### Marketplace design

A traditional way to implement a marketplace is to have a central smart contract that users deposit their NFTs and their price into, and anyone can come by and buy the token for that price.

This approach is reasonable, but it centralizes the process and takes away options from the owners. A better option that's possible with Cadence is to allow users to maintain ownership of the NFTs that they are trying to sell while they are trying to sell them. Instead of taking a centralized approach, each user can list a sale from within their own account.

They'll do this by using a marketplace contract you'll build to store an instance of a `@SaleCollection` resource in their account storage.

Then, the seller, independently or through an app, can either provide a link to their sale to an application that can list it centrally on a website, or even to a central sale aggregator smart contract if they want the entire transaction to stay onchain.

### Validating setup

If you haven't just completed the [Marketplace Setup] tutorial, run the `Validate Setup` script to double-check that your contracts and accounts are in the correct state to begin building the marketplace.

:::info

Remember, we only need to do this again to ensure that the ephemeral state of the playground is set up correctly. Otherwise, you'd already have contracts and users with accounts that are configured ready to go.

:::

The following output appears if your accounts are set up correctly:

```zsh
s.8250c68d2bb3c5398d7f9eac7114a4ac1b7df1d0984d92058b9373f696a1d6a9.OwnerInfo(acct8Balance: 40.00000000, acct9Balance: 40.00000000, acct8IDs: [1], acct9IDs: [])
```

## Setting up an NFT marketplace

Add a new contract called `BasicMarketplace`. It needs to import both of the existing contracts:

```cadence
import ExampleToken from 0x06
import IntermediateNFT from 0x07

access(all) contract BasicMarketplace {
    // TODO
}
```

:::info

Remember, you don't need to own a contract to be able to import it or use any of its public functionality!

:::

### Adding appropriate events

As in Solidity, Cadence smart contracts can emit developer-defined [events] during execution, which can be used to log data that can be observed offchain. This can be used by frontends, and other apps or platforms, including block explorers and data aggregators, which can monitor the state of the contract and related NFTs.

Events in Cadence are declared in a similar fashion as functions, but they start with an access control declaration. The `event` keyword follows, then the name and parameters in parentheses. You can use most of the same types as functions, but you cannot use resources. Resources are moved when used as an argument, and using them and events don't have a method to put them somewhere else or destroy them.

```cadence
access(all) event ForSale(id: UInt64, price: UFix64, owner: Address?)
access(all) event PriceChanged(id: UInt64, newPrice: UFix64, owner: Address?)
access(all) event NFTPurchased(id: UInt64, price: UFix64, seller: Address?, buyer: Address?)
access(all) event SaleCanceled(id: UInt64, seller: Address?)
```

We can anticipate that we'll want to emit events when users take standard actions with the contract, such as when NFTs are listed, purchased, the price is changed, or the sale is cancelled.

We're marking the addresses as optional, because there's some circumstances where an NFT might not have an owner, so those addresses would be `nil`.

### Creating a resource to put items up for sale

Next, we need to configure a [resource] that users can use to put their NFTs up for sale, and other users can use to then purchase those NFTs for fungible tokens. In it, you'll need to add:

- A [capability] to access the owner's collection.
- A place to store the prices of NFTs for sale.
- A [capability] to deposit tokens into the sellers vault when an NFT is purchased.

You'll also need functions to:

- Allow the owner to list an NFT for sale.
- Allow the owner to cancel a sale.
- Allow the owner to change the price.
- Allow a third party to buy the NFT, and deposit the purchase price in the seller's vault.

### Definition and initialization

To define and initialize:

1. Create the resource definition:

   ```cadence
   access(all) resource SaleCollection  {
       // TODO
   }
   ```

   :::info[Reminder]

   In this case, `access(all)` is giving public scope to the **definition** of the resource type, **not** any given instance of the resource or anything in one of those instances. It's good to make these public so that others can build contracts and apps that interact with yours.

   :::

1. In it, add a variable to store a capability for the owner's collection with the ability to withdraw from the collection:

   ```cadence
   access(self) let ownerCollection: Capability<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>
   ```

   :::info[Reminder]

   You'll get errors until after you write the `init` function and assign values to these properties.

   :::

1. Add a dictionary to relate NFT ids to the sale price for that NFT:

   ```cadence
   access(self) let prices: {UInt64: UFix64}
   ```

   :::info[reminder]

   `access(self)` limits access to the resource itself, from within the resource.

   :::

1. Add a variable to store a capability for a sellers fungible token vault's receiver:

   ```cadence
   access(account) let ownerVault: Capability<&{ExampleToken.Receiver}>
   ```

### Resource-owned capabilities

You first learned about basic function and use of [capabilities] in the [capabilities tutorial]. They're links to private objects in account storage that specify and expose a subset of the resource they are linked to.

With the marketplace contract, we are utilizing a new feature of capabilities — they can be stored anywhere! Lots of functionality is contained within resources, and developers will sometimes want to be able to access some of the functionality of resources from within different resources or contracts.

We stored two different capabilities in the marketplace sale collection:

```cadence
access(self) var ownerCollection: Capability<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>
access(account) let ownerVault: Capability<&{ExampleToken.Receiver}>
```

If an object like a contract or resource owns a capability, they can borrow a reference to that capability at any time to access that functionality without having to get it from the owner's account every time.

This is especially important if the owner wants to expose some functionality that is only intended for one person, meaning that the link for the capability is not stored in a public path.

We do that in this example, because the sale collection stores a capability that can access the `withdraw` functionality of the `IntermediateNFT.Collection` with the `IntermediateNFT.Withdraw` entitlement. It needs this because it withdraws the specified NFT in the `purchase()` method to send to the buyer.

It is important to remember that control of a capability does not equal ownership of the underlying resource. You can use the capability to access that resource's functionality, but you can't use it to fake ownership. You need the actual resource (identified by the prefixed `@` symbol) to prove ownership.

Additionally, these capabilities can be stored anywhere, but if a user decides that they no longer want the capability to be used, they can revoke it by getting the controller for the capability from their account with the `getControllers` method and delete the capability with `delete`.

Here is an example that deletes all of the controllers for a specified storage path:

```cadence
let controllers = self.account.capabilities.storage.getControllers(forPath: storagePath)
for controller in controllers {
    controller.delete()
}
```

After this, any capabilities that use that storage path are rendered invalid.

### Initializing the `Resource`

Initialize the resource with arguments for the capabilities needed from the account calling the create transaction.

In `init`, we can take advantage of [preconditions] to make sure that the user has the appropriate capabilities needed to support this functionality by using [`.check()`] for the relevant capabilities.

You could use the pattern we've used before with errors, but since these won't be useful outside of `init`, we can also just include them inside it:

```cadence
access(all) resource SaleCollection  {
    access(self) let ownerCollection: Capability<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>
    access(self) let prices: {UInt64: UFix64}
    access(account) let ownerVault: Capability<&{ExampleToken.Receiver}>

    init (ownerCollection: Capability<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>,
            ownerVault: Capability<&{ExampleToken.Receiver}>) {

        pre {
            // Check that the owner's collection capability is correct
            ownerCollection.check():
                "ExampleMarketplace.SaleCollection.init: "
                .concat("Owner's NFT Collection Capability is invalid! ")
                .concat("Make sure the owner has set up an `IntermediateNFT.Collection` ")
                .concat("in their account and provided a valid capability")

            // Check that the fungible token vault capability is correct
            ownerVault.check():
                "ExampleMarketplace.SaleCollection.init: "
                .concat("Owner's Receiver Capability is invalid! ")
                .concat("Make sure the owner has set up an `ExampleToken.Vault` ")
                .concat("in their account and provided a valid capability")
        }
        self.ownerCollection = ownerCollection
        self.ownerVault = ownerVault
        self.prices = {}
    }
}
```

### Owner functions

Next, we can add the functions that allow the owner to manage their sales. For this, you'll need to first create an [entitlement] to lock the functionality away so that only the owner can use it. Remember, entitlements are declared at the contract level:

```cadence
// Existing events
access(all) event ForSale(id: UInt64, price: UFix64, owner: Address?)
access(all) event PriceChanged(id: UInt64, newPrice: UFix64, owner: Address?)
access(all) event NFTPurchased(id: UInt64, price: UFix64, seller: Address?, buyer: Address?)
access(all) event SaleCanceled(id: UInt64, seller: Address?)

// New entitlement
access(all) entitlement Owner
```

:::info

Strictly speaking, we're not actually going to use this entitlement. We're using it to "lock" the functionality, but we're not giving the entitlement to any other accounts. The owner doesn't need to use this "key" to unlock the functions limited with it — they automatically have access.

:::

1. Add a function that the owner of the resource can use to list one of their tokens for sale, and `emit` an `event` that they've done so.
1. Use a `pre`condition to return an error if they don't own the token they're trying to list. As before, this is probably the only place where this error will be useful, so it can be placed directly in the function:

   ```cadence
   access(Owner) fun listForSale(tokenID: UInt64, price: UFix64) {
       pre {
           self.ownerCollection.borrow()!.idExists(id: tokenID):
               "ExampleMarketplace.SaleCollection.listForSale: "
               .concat("Cannot list token ID ").concat(tokenID.toString())
               .concat(" . This NFT ID is not owned by the seller.")
               .concat("Make sure an ID exists in the sellers NFT Collection")
               .concat(" before trying to list it for sale")
      }
      // store the price in the price array
      self.prices[tokenID] = price

      emit ForSale(id: tokenID, price: price, owner: self.owner?.address)
   }
   ```

1. Add a function to allow changing the price. It should also `emit` the appropriate `event`:

   ```cadence
   access(Owner) fun changePrice(tokenID: UInt64, newPrice: UFix64) {
       self.prices[tokenID] = newPrice

       emit PriceChanged(id: tokenID, newPrice: newPrice, owner: self.owner?.address)
   }
   ```

1. Add a function that allows the owner to cancel their sale. You don't need to do anything with the token itself, as it hasn't left the owners account:

   ```cadence
   access(Owner) fun cancelSale(tokenID: UInt64) {
       // remove the price
       self.prices.remove(key: tokenID)
       self.prices[tokenID] = nil

       // Nothing needs to be done with the actual token because it is already in the owner's collection
   }
   ```

:::info

Solidity devs, take note here! In Cadence, you can build an NFT marketplace without needing to transfer NFTs to a third party or needing to give a third party permission to take the NFT.

:::

### Purchasing an NFT

Now, you need to add a function that anyone can call and use to purchase the NFT. It needs to accept arguments for:

- The token to be purchased.
- The recipient's collection that is going to receive the NFT.
- A vault containing the purchase price.

```cadence
access(all) fun purchase(
        tokenID: UInt64,
        recipient: Capability<&IntermediateNFT.Collection>, buyTokens: @ExampleToken.Vault
    ) {
    // TODO
}
```

:::warning

You are **not** providing the purchaser's vault here — that's an anti-pattern. Instead, create a temporary vault and use that to transfer the tokens.

:::

You'll also want to use `pre`conditions to check and provide errors as appropriate for:

- The NFT with the provided ID is for sale.
- The buyer has included the correct amount of tokens in the provided vault.
- The buyer has the collection capability needed to receive the NFT.

```cadence
pre {
    self.prices[tokenID] != nil:
        "ExampleMarketplace.SaleCollection.purchase: "
        .concat("Cannot purchase NFT with ID ")
        .concat(tokenID.toString())
        .concat(" There is not an NFT with this ID available for sale! ")
        .concat("Make sure the ID to purchase is correct.")
    buyTokens.balance >= (self.prices[tokenID] ?? 0.0):
        "ExampleMarketplace.SaleCollection.purchase: "
        .concat(" Cannot purchase NFT with ID ")
        .concat(tokenID.toString())
        .concat(" The amount provided to purchase (")
        .concat(buyTokens.balance.toString())
        .concat(") is less than the price of the NFT (")
        .concat(self.prices[tokenID]!.toString())
        .concat("). Make sure the ID to purchase is correct and ")
        .concat("the correct amount of tokens have been used to purchase.")
    recipient.borrow != nil:
        "ExampleMarketplace.SaleCollection.purchase: "
        .concat(" Cannot purchase NFT with ID ")
        .concat(tokenID.toString())
        .concat(". The buyer's NFT Collection Capability is invalid.")
}
```

Assuming these checks all pass, your function then needs to:

- Get a reference of the price of the token then clear it.
- Get a reference to the owner's vault and deposit the tokens from the transaction vault.
- Get a reference to the NFT receiver for the buyer.
- Deposit the NFT into the buyer's collection.
- Emit the appropriate event.

```cadence
// get the value out of the optional
let price = self.prices[tokenID]!

self.prices[tokenID] = nil

let vaultRef = self.ownerVault.borrow()
    ?? panic("Could not borrow reference to owner token vault")

// deposit the purchasing tokens into the owners vault
vaultRef.deposit(from: <-buyTokens)

// borrow a reference to the object that the receiver capability links to
// We can force-cast the result here because it has already been checked in the pre-conditions
let receiverReference = recipient.borrow()!

// deposit the NFT into the buyers collection
receiverReference.deposit(token: <-self.ownerCollection.borrow()!.withdraw(withdrawID: tokenID))

emit NFTPurchased(id: tokenID, price: price, seller: self.owner?.address, buyer: receiverReference.owner?.address)
```

The full function should be similar to:

```cadence
// purchase lets a user send tokens to purchase an NFT that is for sale
access(all) fun purchase(tokenID: UInt64,
                            recipient: Capability<&IntermediateNFT.Collection>, buyTokens: @ExampleToken.Vault) {
    pre {
        self.prices[tokenID] != nil:
            "ExampleMarketplace.SaleCollection.purchase: "
            .concat("Cannot purchase NFT with ID ")
            .concat(tokenID.toString())
            .concat(" There is not an NFT with this ID available for sale! ")
            .concat("Make sure the ID to purchase is correct.")
        buyTokens.balance >= (self.prices[tokenID] ?? 0.0):
            "ExampleMarketplace.SaleCollection.purchase: "
            .concat(" Cannot purchase NFT with ID ")
            .concat(tokenID.toString())
            .concat(" The amount provided to purchase (")
            .concat(buyTokens.balance.toString())
            .concat(") is less than the price of the NFT (")
            .concat(self.prices[tokenID]!.toString())
            .concat("). Make sure the ID to purchase is correct and ")
            .concat("the correct amount of tokens have been used to purchase.")
        recipient.borrow != nil:
            "ExampleMarketplace.SaleCollection.purchase: "
            .concat(" Cannot purchase NFT with ID ")
            .concat(tokenID.toString())
            .concat(". The buyer's NFT Collection Capability is invalid.")
    }

    let price = self.prices[tokenID]!
    self.prices[tokenID] = nil

    let vaultRef = self.ownerVault.borrow()
        ?? panic("Could not borrow reference to owner token vault")
    vaultRef.deposit(from: <-buyTokens)

    // borrow a reference to the object that the receiver capability links to
    // We can force-cast the result here because it has already been checked in the pre-conditions
    let receiverReference = recipient.borrow()!

    receiverReference.deposit(token: <-self.ownerCollection.borrow()!.withdraw(withdrawID: tokenID))

    emit NFTPurchased(id: tokenID, price: price, seller: self.owner?.address, buyer: receiverReference.owner?.address)
}
```

### Views

Finally, add a couple of views so that others can read the prices for NFTs and which ones are for sale:

```cadence
access(all) view fun idPrice(tokenID: UInt64): UFix64? {
    return self.prices[tokenID]
}

access(all) view fun getIDs(): [UInt64] {
    return self.prices.keys
}
```

### Creating a `SaleCollection`

Last, but not least, you need to add a contract-level function that allows users to create their own `SaleCollection` resource. It needs to accept the same arguments as the `init` for the resource, pass them into the `create` call, and return the newly-created resource:

:::warning

Make sure you don't accidentally put this function inside the `SaleCollection` resource!

:::

```cadence
access(all) fun createSaleCollection(
    ownerCollection: Capability<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>,
    ownerVault: Capability<&{ExampleToken.Receiver}>
): @SaleCollection
{
    return <- create SaleCollection(ownerCollection: ownerCollection, ownerVault: ownerVault)
}
```

### Marketplace contract summary

That's it! You've completed the contract needed to allow anyone who owns the NFTs and fungible tokens you've created to sell one, accepting payment in the other! This marketplace contract has resources that function similarly to the NFT `Collection` you built in [Non-Fungible Tokens], with a few differences and additions.

This marketplace contract has methods to add and remove NFTs, but instead of storing the NFT resource object in the sale collection, the user provides a capability to their main collection that allows the listed NFT to be withdrawn and transferred when it is purchased. When a user wants to put their NFT up for sale, they do so by providing the ID and the price to the `listForSale()` function.

Then, another user can call the `purchase()` function, sending an `ExampleToken.Vault` that contains the currency they are using to make the purchase. The buyer also includes a capability to their NFT `IntermediateNFT.Collection` so that the purchased token can be immediately deposited into their collection when the purchase is made.

The owner of the sale saves a capability to their Fungible Token `Receiver` within the sale. This allows the sale resource to be able to immediately deposit the currency that was used to buy the NFT into the owners `Vault` when a purchase is made.

Finally, a marketplace contract includes appropriate `event`s that are emitted when important actions happen. External apps can monitor these events to know the state of the smart contract.

### Deployment

Deploy the marketplace contract with account `0x0a`.

## Using the marketplace

Now that you've set up your user accounts, and deployed the contracts for the NFT, fungible token, and marketplace, it's time to write a few `transaction`s to tie everything together.

:::info

One of the most useful features of Cadence is that transactions are code written in Cadence. You can use this to add functionality after deploying your contracts — you're not limited to only the functions you thought of when you wrote the contract.

:::

### Building a transaction to create a sale

Now it's time to write a `transaction` to `create` a `SaleCollection` and list account `0x08`'s token for sale.

:::tip

Depending on your app design, you might want to break these steps up into separate transactions to set up the the `SaleCollection` and add an NFT to it.

:::

1. Import the three contracts and add a `prepare` statement with auth to `SaveValue`, `StorageCapabilities`, and `PublishCapability`:

   ```cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   transaction {
       prepare(acct: auth(SaveValue, StorageCapabilities, PublishCapability) &Account) {
           // TODO
       }
   }
   ```

1. Complete the following in `prepare`:

   - Borrow a reference to the user's vault.
   - Create an entitled capability to the user's NFT collection.
   - Use these to to create a `SaleCollection` and store it in a constant.

   ```cadence
   let receiver = acct.capabilities.get<&{ExampleToken.Receiver}>(ExampleToken.VaultPublicPath)
   let collectionCapability = acct.capabilities.storage.issue
                               <auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>
                               (IntermediateNFT.CollectionStoragePath)
   let sale <- BasicMarketplace.createSaleCollection(ownerCollection: collectionCapability, ownerVault: receiver)
   ```

1. Use your `sale` instance of the collection to create a sale. Afterwards, `move (<-)` it into account storage:

   ```cadence
   sale.listForSale(tokenID: 1, price: 10.0)
   acct.storage.save(<-sale, to: /storage/NFTSale)
   ```

   :::tip

   You might be tempted to change the order here to handle creating the `SaleCollection` and storing it first, then using it to create a sale.

   This won't work because resources can only be moved — they can't be copied. Once you `move (<-)` `sale` to storage, `sale` is no longer usable.

   :::

1. Create and publish a public capability so that others can use the public functions of this resource to find and purchase NFTs:

   ```cadence
   let publicCap = acct.capabilities.storage.issue<&BasicMarketplace.SaleCollection>(/storage/NFTSale)
   acct.capabilities.publish(publicCap, at: /public/NFTSale)
   ```

1. Call the transaction with account `0x08`.

### Checking for NFTs to purchase

Let's create a script to ensure that the sale was created correctly:

1. Add a new one called `GetSaleIDsAndPrices`. 
1. Import the contracts and stub out a script that accepts an `Address` as an argument and returns a `UInt64` array:

   ```cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   access(all)
   fun main(address: Address): [UInt64] {
      // TODO
   }
   ```

1. In the script:

   - Use the `address` to get a public account object for that address.
   - Attempt to borrow a reference to the public capability for the `SaleCollection` in that account:
      - Panic and return an error if it's not found.
      - Call `getIDs` if it is, and return the list of NFTs for sale.

   ```cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   access(all)
   fun main(address: Address): [UInt64] {

       let account = getAccount(address)

       let saleRef = account.capabilities.borrow<&BasicMarketplace.SaleCollection>(/public/NFTSale)
           ?? panic("Could not borrow a reference to the SaleCollection capability for the address provided")

       return saleRef.getIDs()
   }
   ```

1. Run the script. You should be part of the way there:

   ```zsh
   [1]
   ```

   The script returns an array containing the one NFT for sale, but what about the prices? We added a function to return the price of a given NFT, but not a list or array.

   We could update the contract since we own it (another power of Cadence), but even if we didn't, we could always add functionality via a script.
   
1. Update your script to create a `struct` to return the data in, then fetch the list of IDs, loop through them to get the prices, and return an array with the prices:

   ```cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   access(all) struct Pair {
       access(all) let id: UInt64
       access(all) let value: UFix64

       init(id: UInt64, value: UFix64) {
           self.id = id
           self.value = value
       }
   }

   access(all)
   fun main(address: Address): [Pair] {

       let account = getAccount(address)

       let saleRef = account.capabilities.borrow<&BasicMarketplace.SaleCollection>(/public/NFTSale)
           ?? panic("Could not borrow a reference to the SaleCollection capability for the address provided")

       let ids = saleRef.getIDs()

       let pricePairs: [Pair] = []

       for id in ids {
           let pair = Pair(id: id, value: saleRef.idPrice(tokenID: id) ?? 0.0)
           pricePairs.append(pair)
       }

       return pricePairs
   }
   ```

## Purchasing an NFT

Finally, you can add a transaction that a buyer can use to purchase the seller's NFT with their fungible tokens.

1. Create a `transaction` called `PurchaseNFT`, import the contract, and stub it out:

   ```cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   transaction(sellerAddress: Address, tokenID: UInt64, price: UFix64) {

       let collectionCapability: Capability<&IntermediateNFT.Collection>
       let temporaryVault: @ExampleToken.Vault

       prepare(acct: auth(BorrowValue) &Account) {
           // TODO
       }

       execute {
           // TODO
       }
   }
   ```

1. Complete the following in `prepare`:

   - `get` the `collectionCapability` for the caller's NFT collection.
   - `borrow` an authorized reference to the buyers token vault.
   - Withdraw the purchase price from the buyers vault and `move (<-)` it into the temporary vault.

   ```cadence
   self.collectionCapability = acct.capabilities.get<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)

   let vaultRef = acct
       .storage.borrow<auth(ExampleToken.Withdraw) &ExampleToken.Vault>(from: /storage/CadenceFungibleTokenTutorialVault)
       ?? panic("Could not borrow a reference to "
                    .concat("ExampleToken.Vault")
                    .concat(". Make sure the user has set up an account ")
                    .concat("with an ExampleToken Vault and valid capability."))

   self.temporaryVault <- vaultRef.withdraw(amount: price)
   ```

1. Complete the following in `execute`:

   - Get a reference to the public account for the `sellerAddress`.
   - `borrow` a reference to the seller's `SaleCollection`.
   - Call `purchase` with the `tokenID`, buyers collection capability, and the temporary vault.

   ```cadence
   let seller = getAccount(sellerAddress)

   let saleRef = seller.capabilities.get<&BasicMarketplace.SaleCollection>(/public/NFTSale)
                       .borrow()
       ?? panic("Could not borrow a reference to "
                    .concat("the seller's ExampleMarketplace.SaleCollection")
                    .concat(". Make sure the seller has set up an account ")
                    .concat("with an ExampleMarketplace SaleCollection and valid capability."))

   saleRef.purchase(tokenID: tokenID, recipient: self.collectionCapability, buyTokens: <-self.temporaryVault)
   ```

1. Call the transaction with account `0x09` to purchase the token with id `1` from `0x08` for `10.0` tokens.

## Verifying the NFT was purchased correctly

You've already written the scripts you need to check for NFT ownership and token balances. Copy them over from your earlier projects, or use the ones below:

```cadence
import ExampleToken from 0x06

access(all)
fun main(address: Address): String {
    let account = getAccount(address)

    let accountReceiverRef = account.capabilities.get<&{ExampleToken.Balance}>(ExampleToken.VaultPublicPath)
                            .borrow()
            ?? panic(ExampleToken.vaultNotConfiguredError(address: address))

    return("Balance for "
        .concat(address.toString())
        .concat(": ").concat(accountReceiverRef.balance.toString())
        )
}
```

```cadence
import IntermediateNFT from 0x07

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

## Creating a marketplace for any generic NFT

The previous examples show how a simple marketplace can be created for a specific class of NFTs. However, users will want to have a marketplace where they can buy and sell **any** NFT they want, regardless of its type.

To learn more about a completely decentralized example of a generic marketplace, check out the [NFT storefront repo]. This contract is already deployed to testnet and mainnet and can be used by anyone for any generic NFT sale!

## Accepting payment in $FLOW

What about accepting payment in the network token, [$FLOW]? We can't quite update this simplified marketplace to accept it, but it's actually quite simple to do so because the network token follows the [Flow Fungible Token standard].

In other words, if you configure your marketplace to accept any token that follows the full standard, it will also be able to use the Flow token!

## Conclusion

In this tutorial, you constructed a simplified NFT marketplace on Flow using the composability of Cadence resources, interfaces, and capabilities. You learned how to:

- Build a marketplace contract that allows users to list, buy, and sell NFTs in exchange for fungible tokens.
- Leverage capabilities and entitlements to securely manage access and transfers.
- Emit and observe events to track marketplace activity.
- Write and execute transactions and scripts to interact with the marketplace and verify asset ownership and balances.

By completing this tutorial, you are now able to:

- Construct composable smart contracts that integrate multiple token standards.
- Implement secure and flexible resource management using Cadence's type system.
- Develop and test end-to-end flows for NFT sales and purchases on Flow.

If you're ready to take your skills further, explore the [NFT storefront repo] for a production-ready, generic NFT marketplace, or try extending your marketplace to support additional features and token types!

## Reference solution

:::warning

You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.

:::

- [Reference Solution]

<!-- Reference-style links. Will not render on page. -->

[NFT storefront repo]: https://github.com/onflow/nft-storefront
[Marketplace Setup Tutorial]: ./07-marketplace-setup.md
[marketplace setup]: ./07-marketplace-setup.md
[Setup Reference Solution]: https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64
[Interfaces]: ../language/interfaces.mdx
[Resources]: ../language/resources.mdx
[Resource]: ../language/resources.mdx
[Capabilities]: ../language/capabilities.md
[capability]: ../language/capabilities.md
[events]: ../language/events.md
[preconditions]: ../language/functions.mdx#function-preconditions-and-postconditions
[`.check()`]: ../language/accounts/capabilities.mdx#checking-the-existence-of-public-capabilities
[entitlement]: ../language/access-control.md#entitlements
[Non-Fungible Tokens]: ./05-non-fungible-tokens-1.md
[capabilities tutorial]: ./04-capabilities.md
[$FLOW]: https://developers.flow.com/build/core-contracts/flow-token
[Flow Fungible Token standard]: https://github.com/onflow/flow-ft
[Reference Solution]: https://play.flow.com/d8906744-aa9b-4323-9f72-ccf78ab8e4b2
