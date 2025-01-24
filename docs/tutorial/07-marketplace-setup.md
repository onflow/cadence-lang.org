---
title: 7. Marketplace Setup
---

:::warning

We're in the process of updating the Cadence tutorial series.  This tutorial, and the ones following, have **not** yet been updated.

Check back, or follow us on socials.  These will be updated soon!

:::

In this tutorial, we're going to create a marketplace that uses both the fungible
and non-fungible token (NFTs) contracts that we have learned about in previous tutorials.
This page requires you to execute a series of transactions to setup your accounts to complete the Marketplace tutorial.
The next page contains the main content of the tutorial.

When you are done with the tutorial, check out the [NFTStorefront repo](https://github.com/onflow/nft-storefront)
for an example of a production ready marketplace that you can use right now on testnet or mainnet!

---

:::info[Action]

Open the starter code for this tutorial in the Flow Playground:
<a
  href="https://play.flow.com/7355d51c-066b-46be-adab-a3da6c28b645"
  target="_blank"
>
  https://play.flow.com/7355d51c-066b-46be-adab-a3da6c28b645
</a>
The tutorial will be asking you to take various actions to interact with this code.

:::

If you have already completed the Marketplace tutorial, please move on to [Composable Resources: Kitty Hats](./10-resources-compose.md).

This guide will help you quickly get the playground to the state you need to complete the Marketplace tutorial.
The marketplace tutorial uses the Fungible Token and Non-Fungible token contracts
to allow users to buy and sell NFTs with fungible tokens.

---

:::info[Action]

Some of the code in these setup instructions has intentional errors built into it.
You should understand enough about Cadence to be able to fix these tutorials on your own.
All of the errors involve concepts that you have learned in previous tutorials

:::

1. Open the `ExampleToken` contract. This is the same contract from the fungible token tutorial.
2. Deploy the `ExampleToken` code to account `0x06`.
3. Switch to the `ExampleNFT` contract (Contract 2)
4. Deploy the NFT code to account `0x07` by selecting it as the deploying signer.
5. Run the transaction in "Setup 6". This is the `SetupAccount6Transaction.cdc` file.
   Use account `0x06` as the only signer to set up account `0x06`'s storage.

```cadence SetupAccount6Transaction.cdc
// SetupAccount6Transaction.cdc

import ExampleToken from 0x06
import ExampleNFT from 0x07

// This transaction sets up account 0x06 for the marketplace tutorial
// by publishing a Vault reference and creating an empty NFT Collection.
transaction {
  prepare(acct: auth(SaveValue) &Account) {
        // Create a public Receiver capability to the Vault
    let receiverCap = acct.capabilities.storage.issue<&{ExampleToken.Receiver}>(
        /storage/CadenceFungibleTokenTutorialVault
    )
    acct.capabilities.publish(receiverCap, at: /public/CadenceFungibleTokenTutorialReceiver)

    // store the empty NFT Collection in account storage
    acct.storage.save(<-ExampleNFT.createEmptyCollection(nftType: nil), to: ExampleNFT.CollectionStoragePath)

    log("Collection created for account 2")

    // create a public capability for the Collection
    let cap = acct.capabilities.storage.issue<&ExampleNFT.Collection>(ExampleNFT.CollectionStoragePath)
    acct.capabilities.publish(cap, at: ExampleNFT.CollectionStoragePath)
  }
}
```

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
