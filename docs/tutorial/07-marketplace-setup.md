---
title: 7. Marketplace Setup
---

In this tutorial, we're going to create a marketplace that uses both the fungible and non-fungible token (NFTs) contracts that we have learned about in previous tutorials. You'll execute a series of transactions to set up the accounts that you'll need to complete the marketplace tutorial. You'll build the marketplace itself in the next tutorial.

:::warning

If you're farther along with your Cadence learning journey and found this page looking for a production-ready marketplace, check out the [NFTStorefront repo]!

:::

## Objectives

After completing this tutorial, you'll be able to:

-

## Getting Started

:::info[Action]

Open the starter code for this tutorial in the Flow Playground:

<a href="https://play.flow.com/XXXX" target="_blank">
https://play.flow.com/XXXX
</a>

:::

To start, you'll need to deploy some copies of the contracts you've built in the previous tutorials. For your convenience, they've been provided in the starter playground.

:::info[Action]

1. Open the `ExampleToken` contract. This is the same contract from the fungible token tutorial.
2. Deploy the `ExampleToken` code to account `0x06`.
3. Switch to the `IntermediateNFT` contract.
4. Deploy the NFT code to account `0x07` by selecting it as the deploying signer.

:::

## Account Setup Transactions

Next, you'll need to build transactions to set up accounts `0x06` and `0x07` to be able to work with the contracts for the marketplace.

:::tip

**Remember**: On Flow, accounts must maintain a balance of $FLOW proportional to the amount of storage the account is using. As a result, accounts can **not** accept arbitrary data (including tokens!) from random contracts without first executing a transaction to allow it.

This might seem like a burden, but it's **great!!** Thanks to this feature, one of the most common causes of burning assets is impossible on Flow. You can **not** send property to a random address - only those that know how to receive it!

:::

### Set Up Account `0x06`

:::info[Action]

Open the `Setup 6` transaction. It's scaffolded for you:

:::

```cadence
import ExampleToken from 0x06
import IntermediateNFT from 0x07

// This transaction sets up account 0x06 for the marketplace tutorial
// by publishing a Vault reference and creating an empty NFT Collection.
transaction {
  // TODO
}
```

This transaction needs to:

- Prepare an account reference with permissions to create and save capabilities
- Create a [capability] to receive our example tokens, and [publish] it
- Call `createEmptyCollection()` from the `IntermediateNFT` contract to create a collection
- Create and publish public capabilities for the NFT collection

:::info[Action]

Build this transaction on your own. **Hint:** The fungible token and NFT contracts both have constants for the appropriate storage locations needed for the above.

:::

You should end up with something similar to:

```cadence
import ExampleToken from 0x06
import IntermediateNFT from 0x07

// This transaction sets up account 0x06 for the marketplace tutorial
// by publishing a Vault reference and creating an empty NFT Collection.
transaction {
  prepare(acct: auth(SaveValue, Capabilities) &Account) {
        // Create a public Receiver capability to the Vault
    let receiverCap = acct.capabilities.storage.issue<&{ExampleToken.Receiver}>(
        /storage/CadenceFungibleTokenTutorialVault
    )
    acct.capabilities.publish(receiverCap, at: /public/CadenceFungibleTokenTutorialReceiver)

    // store the empty NFT Collection in account storage
    acct.storage.save(<-IntermediateNFT.createEmptyCollection(), to: IntermediateNFT.CollectionStoragePath)

    log("Collection created for account 2")

    // create a public capability for the Collection
    let cap = acct.capabilities.storage.issue<&IntermediateNFT.Collection>(IntermediateNFT.CollectionStoragePath)
    acct.capabilities.publish(cap, at: IntermediateNFT.CollectionPublicPath)
  }
}
```

:::info[Action]

Run the transaction using `0x06` as the signer.

:::

### Set Up Account `0x07`

:::info[Action]

Open the `Setup 7` transaction. It's also scaffolded for you:

:::

This transaction needs to:

- Create and add an empty `ExampleToken` vault and add the `Receiver` capability
- Instantiate a constant for and borrow a reference to the `IntermediateNFT` contract
-

:::hint

You'll need to use `prepare` and `execute` in this `transaction`.

:::

:::info[Action]

Build this transaction on your own as well. **Reminder:** The fungible token and NFT contracts both have constants for the appropriate storage locations needed for the above.

:::

7. Run the second transaction, "Setup 7". This is the `SetupAccount7Transaction.cdc` file.
   Use account `0x07` as the only signer to set up account `0x07`'s storage.

```cadence SetupAccount7Transaction.cdc
// SetupAccount7Transaction.cdc

import ExampleToken from 0x06
import ExampleNFT from 0x07

// This transaction adds an empty Vault to account 0x07
// and mints an NFT with id=1 that is deposited into
// the NFT collection on account 0x06.
transaction {

  // Private reference to this account's minter resource
  let minterRef: &ExampleNFT.NFTMinter

  prepare(acct: auth(BorrowValue, SaveValue, StorageCapabilities, PublishCapability) &Account) {
    // create a new vault instance
    let vaultA <- ExampleToken.createEmptyVault()

    // Store the vault in the account storage
    acct.storage.save(<-vaultA, to: ExampleToken.VaultStoragePath)

    // Create a public Receiver capability to the Vault
    let receiverCap = acct.capabilities.storage.issue<&ExampleToken.Vault>(
        ExampleToken.VaultStoragePath
    )
    acct.capabilities.publish(receiverCap, at: ExampleToken.VaultPublicPath)
  }
  execute {
    // Get the recipient's public account object
    let recipient = getAccount(0x06)

    // Get the Collection reference for the receiver
    // getting the public capability and borrowing a reference from it
    let receiverRef = recipient.capabilities
        .borrow<&ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)
        ?? panic("Could not borrow a collection reference to 0x06's ExampleNFT.Collection"
                 .concat(" from the path ")
                 .concat(ExampleNFT.CollectionPublicPath.toString())
                 .concat(". Make sure account 0x06 has set up its account ")
                 .concat("with an ExampleNFT Collection."))

    // Mint an NFT and deposit it into account 0x06's collection
    receiverRef.deposit(token: <-ExampleNFT.mintNFT())
  }
}
```

8. Run the transaction in "Setup 6". This is the `SetupAccount6TransactionMinting.cdc` file.
   Use account `0x06` as the only signer to mint fungible tokens for account 6 and 7.

```cadence SetupAccount6TransactionMinting.cdc
// SetupAccount6TransactionMinting.cdc

import ExampleToken from 0x06
import ExampleNFT from 0x07

// This transaction mints tokens for both accounts using
// the minter stored on account 0x06.
transaction {

  // Public Vault Receiver References for both accounts
  let acct6Capability: Capability<&{ExampleToken.Receiver}>
  let acct7Capability: Capability<&{ExampleToken.Receiver}>

  // Private minter references for this account to mint tokens
  let minterRef: &ExampleToken.VaultMinter

  prepare(acct: auth(SaveValue, StorageCapabilities, BorrowValue) &Account) {
    // Get the public object for account 0x07
    let account7 = getAccount(0x07)

    // Retrieve public Vault Receiver references for both accounts
    self.acct6Capability = acct.capabilities.get<&{ExampleToken.Receiver}>(/public/CadenceFungibleTokenTutorialReceiver)
    self.acct7Capability = account7.capabilities.get<&{ExampleToken.Receiver}>(/public/CadenceFungibleTokenTutorialReceiver)

    // Get the stored Minter reference for account 0x06
    self.minterRef = acct.storage.borrow<&ExampleToken.VaultMinter>(from: /storage/CadenceFungibleTokenTutorialMinter)
        ?? panic("Could not borrow owner's vault minter reference")
  }

  execute {
    // Mint tokens for both accounts
    self.minterRef.mintTokens(amount: 20.0, recipient: self.acct7Capability)
    self.minterRef.mintTokens(amount: 10.0, recipient: self.acct6Capability)
  }
}
```

9. Run the script `CheckSetupScript.cdc` file in Script 1 to ensure everything is set up.

```cadence CheckSetupScript.cdc
// CheckSetupScript.cdc

import ExampleToken from 0x06
import ExampleNFT from 0x07

/// Allows the script to return the ownership info
/// of all the accounts
access(all) struct OwnerInfo {
  access(all) let acct6Balance: UFix64
  access(all) let acct7Balance: UFix64

  access(all) let acct6IDs: [UInt64]
  access(all) let acct7IDs: [UInt64]

  init(balance1: UFix64, balance2: UFix64, acct6IDs: [UInt64], acct7IDs: [UInt64]) {
    self.acct6Balance = balance1
    self.acct7Balance = balance2
    self.acct6IDs = acct6IDs
    self.acct7IDs = acct7IDs
  }
}

// This script checks that the accounts are set up correctly for the marketplace tutorial.
//
// Account 0x06: Vault Balance = 40, NFT.id = 1
// Account 0x07: Vault Balance = 20, No NFTs
access(all) fun main(): OwnerInfo {
    // Get the accounts' public account objects
    let acct6 = getAccount(0x06)
    let acct7 = getAccount(0x07)

    // Get references to the account's receivers
    // by getting their public capability
    // and borrowing a reference from the capability
    let acct6ReceiverRef = acct6.capabilities.get<&{ExampleToken.Balance}>
                          (/public/CadenceFungibleTokenTutorialReceiver)
                          .borrow()
            ?? panic("Could not borrow a balance reference to "
                     .concat("0x06's ExampleToken.Vault")
                     .concat(". Make sure 0x06 has set up its account ")
                     .concat("with an ExampleToken Vault and valid capability."))

    let acct7ReceiverRef = acct7.capabilities.get<&{ExampleToken.Balance}>
                          (/public/CadenceFungibleTokenTutorialReceiver)
                          .borrow()
            ?? panic("Could not borrow a balance reference to "
                     .concat("0x07's ExampleToken.Vault")
                     .concat(". Make sure 0x07 has set up its account ")
                     .concat("with an ExampleToken Vault and valid capability."))

    let returnArray: [UFix64] = []

    // verify that the balances are correct
    if acct6ReceiverRef.balance != 40.0 || acct7ReceiverRef.balance != 20.0 {
        panic("Wrong balances!")
    }

    // Find the public Receiver capability for their Collections
    let acct6Capability = acct6.capabilities.get<&{ExampleNFT.NFTReceiver}>(ExampleNFT.CollectionPublicPath)
    let acct7Capability = acct7.capabilities.get<&{ExampleNFT.NFTReceiver}>(ExampleNFT.CollectionPublicPath)

    // borrow references from the capabilities
    let nft1Ref = acct6Capability.borrow()
        ?? panic("Could not borrow a collection reference to 0x06's ExampleNFT.Collection"
                 .concat(" from the path ")
                 .concat(ExampleNFT.CollectionPublicPath.toString())
                 .concat(". Make sure account 0x06 has set up its account ")
                 .concat("with an ExampleNFT Collection."))

    let nft2Ref = acct7Capability.borrow()
        ?? panic("Could not borrow a collection reference to 0x07's ExampleNFT.Collection"
                 .concat(" from the path ")
                 .concat(ExampleNFT.CollectionPublicPath.toString())
                 .concat(". Make sure account 0x07 has set up its account ")
                 .concat("with an ExampleNFT Collection."))

    // verify that the collections are correct
    if nft1Ref.getIDs()[0] != 1 || nft2Ref.getIDs().length != 0 {
        panic("Wrong Collections!")
    }

    // Return the struct that shows the account ownership info
    return OwnerInfo(balance1: acct6ReceiverRef.balance,
                     balance2: acct7ReceiverRef.balance,
                     acct6IDs: nft1Ref.getIDs(),
                     acct7IDs: nft2Ref.getIDs())
}
```

10. The script should not panic and you should see something like this output

```
"Account 6 Balance"
40.00000000
"Account 7 Balance"
20.00000000
"Account 6 NFTs"
[1]
"Account 7 NFTs"
[]
```

---

With your playground now in the correct state, you're ready to continue with the next tutorial.

You do not need to open a new playground session for the marketplace tutorial. You can just continue using this one.

<!-- Reference-style links, do not render on page -->

[NFTStorefront repo]: https://github.com/onflow/nft-storefront
[capability]: ../language/capabilities.md
[publish]: ../language/accounts/capabilities.mdx#publishing-capabilities
