---
title: Marketplace Setup
---

In the [Marketplace Tutorial], we're going to create a marketplace that uses both the fungible and non-fungible token (NFTs) contracts that we have learned about in previous tutorials. First, you'll execute a series of transactions to set up the accounts that you'll need to complete the marketplace tutorial. Next, you'll build the marketplace itself.

:::warning

If you're farther along with your Cadence learning journey and found this page looking for a production-ready marketplace, check out the [NFTStorefront repo]!

:::

## Objectives

In this tutorial, you'll simply execute transactions that you've already written and validate that the setup is complete. It's only necessary because the playground is not actually a blockchain, so the state is transient.

## Getting started

Open the starter code for this tutorial in the Flow Playground: [play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64].

Your goal for this exercise is to set up the ephemeral playground into the state the blockchain would be in when you begin building a marketplace. It's also a great chance to practice some of what you've learned already. You'll need to:

- Deploy the NFT contract on account `0x06`.
- Deploy the fungible token contract on account `0x07`.
- Set up account `0x08` and `0x09` to handle NFTs and tokens compatible with the simplified contracts you've built.
- Give fungible tokens to `0x08`.
- Give an NFT to `0x09`.

To start, you'll need to deploy some copies of the contracts you've built in the previous tutorials, and call transactions you've already built. For your convenience, they've been provided in the starter playground.

1. Open the `ExampleToken` contract. This is the same contract from the fungible token tutorial.
2. Deploy the `ExampleToken` code to account `0x06`.
3. Switch to the `IntermediateNFT` contract.
4. Deploy the NFT code to account `0x07` by selecting it as the deploying signer.

## Account setup transactions

Next, you'll need to execute transactions to set up accounts `0x08` and `0x09` to be able to work with the contracts for the marketplace. You've already built these transactions in previous exercises.

:::tip

**Remember**: On Flow, accounts must maintain a balance of $FLOW proportional to the amount of storage the account is using. Furthermore, placing something in the storage of an account requires that the receiving account has a capability that can accept the asset type. As a result, accounts can **not** accept arbitrary data (including tokens!) from random contracts without first executing a transaction to allow it.

This might seem like a burden, but it's **great!!** Thanks to this feature, one of the most common causes of burning assets is impossible on Flow. You can **not** send property to a random address — only those that know how to receive it!

:::

### NFT setup

Open the `NFT Setup` transaction:

```cadence
import IntermediateNFT from 0x07

transaction() {
  prepare(acct: auth(SaveValue, Capabilities) &Account) {
    // Create an empty NFT collection
    acct.storage.save(<-IntermediateNFT.createEmptyCollection(), to: IntermediateNFT.CollectionStoragePath)

    // Create a public capability for the Collection
    let cap = acct.capabilities.storage.issue<&IntermediateNFT.Collection>(IntermediateNFT.CollectionStoragePath)
    acct.capabilities.publish(cap, at: IntermediateNFT.CollectionPublicPath)
  }

  execute {
    log("Empty NFT Collection Created")
  }
}
```

This transaction will:

- `prepare` an account reference with permissions to create and save capabilities.
- Call `createEmptyCollection()` from the `IntermediateNFT` contract to create a collection.
- Create and publish public capabilities for the NFT collection.

Run the transaction using `0x07` as the signer, then run it again for `0x08`.

### Fungible token setup

Open the `Fungible Token Setup` transaction:

```cadence
import ExampleToken from 0x06

transaction() {
    prepare(acct: auth(SaveValue, Capabilities) &Account) {
        // Create a vault and save it in account storage
        acct.storage.save(<-ExampleToken.createEmptyVault(), to: ExampleToken.VaultStoragePath)

        // Create and publish a receiver for the fungible tokens
        let cap = acct.capabilities.storage.issue<&ExampleToken.Vault>(
            ExampleToken.VaultStoragePath
        )

        acct.capabilities.publish(cap, at: ExampleToken.VaultPublicPath)
    }

    execute {
        log("Vault Created")
    }
}
```

This transaction will:

- Instantiate a constant for and borrow a reference to the `ExampleToken` contract.
- Create and add an empty `ExampleToken` vault.
- Add the `Receiver` [capability] and [publish] it.

Run the transaction using `0x07` as the signer, then run it again for `0x08`.

## Minting NFTs

Now that you've set up both accounts to be able to receive NFTs, it's time to give account `0x08` an NFT to sell to `0x09`.

:::tip

**Reminder**: The `IntermediateNFT` contract allows **anyone** to freely mint NFTs. You wouldn't want this ability in production, but it is in here to streamline the tutorial.

:::

You've already written a transaction to mint an NFT, so we've provided it here. You just need to call it:

```cadence
import IntermediateNFT from 0x07

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

Mint a token with account `0x08`.

## Minting fungible tokens

You've also set up both accounts to be able to receive non-fungible tokens from `ExampleToken`.

:::tip

**Reminder**: The `ExampleToken` contract only allows the owner of the contract to mint NFTs.

:::

You've already written a transaction to mint fungible tokens, so we've provided it here. You just need to call it:

```cadence
import ExampleToken from 0x06

transaction(recipient: Address, amount: UFix64) {
    let mintingRef: &ExampleToken.VaultMinter
    var receiver: Capability<&{ExampleToken.Receiver}>

    prepare(signer: auth(BorrowValue) &Account) {
        self.mintingRef = signer.storage.borrow<&ExampleToken.VaultMinter>(from: /storage/CadenceFungibleTokenTutorialMinter)
            ?? panic(ExampleToken.vaultNotConfiguredError(address: recipient))

        let recipient = getAccount(recipient)

        // Consider further error handling if this fails
        self.receiver = recipient.capabilities.get<&{ExampleToken.Receiver}>
            (ExampleToken.VaultPublicPath)

    }

    execute {
        // Mint tokens and deposit them into the recipient's Vault
        self.mintingRef.mintTokens(amount: amount, recipient: self.receiver)

        log("Tokens minted and deposited to account "
            .concat(self.receiver.address.toString()))
    }
}
```

Call `Mint Tokens` with account `0x06` to grant 40 tokens to `0x09` and 20 tokens to `0x08`.

## Validating the setup

We've provided a script called `Validate Setup` that you can use to make sure you've completed the setup correctly.

Run the `Validate Setup` script and resolve any issues.

The script should not panic, and you should see something like this output:

```zsh
...64807.OwnerInfo(acct8Balance: 40.00000000, acct9Balance: 40.00000000, acct8IDs: [1], acct9IDs: [])
```

## Conclusion

With your playground now in the correct state, you're ready to continue with the next tutorial.

Now that you have completed this tutorial, you are able to:

- Set up accounts and deploy contracts required for a basic NFT marketplace on Flow.
- Configure account storage and capabilities for fungible and non-fungible tokens.
- Validate the correct setup of accounts and assets in preparation for marketplace operations.

You do not need to open a new playground session for the marketplace tutorial. You can just continue using this one.

## Reference Solution

:::warning

You are **not** saving time by skipping to the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.

:::

- [Reference Solution]

<!-- Reference-style links, do not render on page -->

[Marketplace Tutorial]: ./08-marketplace-compose.md
[NFTStorefront repo]: https://github.com/onflow/nft-storefront
[capability]: ../language/capabilities.md
[publish]: ../language/accounts/capabilities.mdx#publishing-capabilities
[Reference Solution]: https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64
[play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64]: https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64
