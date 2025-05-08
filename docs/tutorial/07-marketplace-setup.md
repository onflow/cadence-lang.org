---
title: 7. Marketplace Setup
---

In this tutorial, we're going to create a marketplace that uses both the fungible and non-fungible token (NFTs) contracts that we have learned about in previous tutorials. First, you'll build and execute a series of transactions to set up the accounts that you'll need to complete the marketplace tutorial. You'll build the marketplace itself in the next tutorial.

:::warning

If you're farther along with your Cadence learning journey and found this page looking for a production-ready marketplace, check out the [NFTStorefront repo]!

:::

## Objectives

After completing this tutorial, you'll be able to:

- Set up accounts and deploy contracts required for a basic NFT marketplace on Flow.
- Configure account storage and capabilities for fungible and non-fungible tokens.
- Validate the correct setup of accounts and assets in preparation for marketplace operations.

## Getting Started

:::info[Action]

Open the starter code for this tutorial in the Flow Playground:

<a href="https://play.flow.com/XXXX" target="_blank">
https://play.flow.com/XXXX
</a>

:::

Your goal for this exercise is to set up the ephemeral playground into the state the blockchain would be in when you begin building a marketplace. It's also a great chance to practice some of what you've learned already. You'll need to:

- Deploy the NFT contract on account `0x06`
- Deploy the fungible token contract on account `0x07`
- Set up account `0x08` and `0x09` to handle NFTs and tokens compatible with the simplified contracts you've built
- Give fungible tokens to `0x08`
- Give an NFT to `0x09`

To start, you'll need to deploy some copies of the contracts you've built in the previous tutorials. For your convenience, they've been provided in the starter playground.

:::info[Action]

1. Open the `ExampleToken` contract. This is the same contract from the fungible token tutorial.
2. Deploy the `ExampleToken` code to account `0x06`.
3. Switch to the `IntermediateNFT` contract.
4. Deploy the NFT code to account `0x07` by selecting it as the deploying signer.

:::

## Account Setup Transactions

Next, you'll need to build transactions to set up accounts `0x08` and `0x09` to be able to work with the contracts for the marketplace.

:::tip

**Remember**: On Flow, accounts must maintain a balance of $FLOW proportional to the amount of storage the account is using. Furthermore, placing something in the storage of an account requires that the receiving account has a capability that can accept the asset type. As a result, accounts can **not** accept arbitrary data (including tokens!) from random contracts without first executing a transaction to allow it.

This might seem like a burden, but it's **great!!** Thanks to this feature, one of the most common causes of burning assets is impossible on Flow. You can **not** send property to a random address - only those that know how to receive it!

:::

### NFT Setup

:::info[Action]

Open the `NFT Setup` transaction. It's scaffolded for you:

:::

```cadence
import IntermediateNFT from 0x07

transaction() {
  // TODO
}
```

This transaction needs to:

- `prepare` an account reference with permissions to create and save capabilities
- Call `createEmptyCollection()` from the `IntermediateNFT` contract to create a collection
- Create and publish public capabilities for the NFT collection

:::info[Action]

Build this transaction on your own. **Hint:** The NFT contract has constants for the appropriate storage locations needed for the above.

:::

You should end up with something similar to:

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
}
```

:::info[Action]

Run the transaction using `0x07` as the signer, then run it again for `0x08`.

:::

### Fungible Token Setup

:::info[Action]

Open the `Fungible Token Setup` transaction. It's also scaffolded for you:

:::

```cadence
import ExampleToken from 0x06

transaction() {
  // TODO
}
```

This transaction needs to:

- Instantiate a constant for and borrow a reference to the `ExampleToken` contract
- Create and add an empty `ExampleToken` vault
- Add the `Receiver` [capability] and [publish] it

:::info[Action]

Build this transaction on your own as well. **Reminder:** The fungible token contract has constants for the appropriate storage locations needed for the above.

:::

You should end up with something similar to:

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

:::info[Action]

Run the transaction using `0x07` as the signer, then run it again for `0x08`.

:::

## Mint NFTs

Now that you've set up both account to be able to receive NFTs, it's time to give account `0x08` an NFT to sell to `0x09`.

:::tip

**Reminder**: The `IntermediateNFT` contract allow **anyone** to freely mint NFTs.

:::

You've already written a transaction to mint an NFT, so we've provided it here. You just need to call it.

:::info[Action]

Mint a token with account `0x08`.

:::

## Mint Fungible Tokens

You've also set up both accounts to be able to receive nonfungible tokens from `ExampleToken`.

:::tip

**Reminder**: The `ExampleToken` contract only allows the owner of the contract to mint NFTs.

:::

You've already written a transaction to mint fungible tokens, so we've provided it here. You just need to call it.

:::info[Action]

Call `Mint Tokens` with account `0x06` to grant 40 tokens to `0x09` and 20 tokens to `0x08`

:::

## Validate Setup

We've provided a script called `Validate Setup` that you can use to make sure you've completed the setup correctly.

:::info[Action]

Run the `Validate Setup` script and resolve any issues.

:::

The script should not panic and you should see something like this output:

```zsh
...64807.OwnerInfo(acct8Balance: 40.00000000, acct9Balance: 40.00000000, acct8IDs: [1], acct9IDs: [])
```

## Conclusion

With your playground now in the correct state, you're ready to continue with the next tutorial.

Now that you have completed this tutorial, you able to:

- Set up accounts and deploy contracts required for a basic NFT marketplace on Flow.
- Configure account storage and capabilities for fungible and non-fungible tokens.
- Validate the correct setup of accounts and assets in preparation for marketplace operations.

You do not need to open a new playground session for the marketplace tutorial. You can just continue using this one.

## Reference Solution

:::warning

You are **not** saving time by skipping to the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.

:::

[Reference Solution]

<!-- Reference-style links, do not render on page -->

[NFTStorefront repo]: https://github.com/onflow/nft-storefront
[capability]: ../language/capabilities.md
[publish]: ../language/accounts/capabilities.mdx#publishing-capabilities
[Reference Solution]: https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64
