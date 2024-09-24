---
title: Environment Information
sidebar_position: 29
---

## Transaction Information

To get the addresses of the signers of a transaction,
use the `address` field of each signing `Account`
that is passed to the transaction's `prepare` phase.

There is currently no API that allows getting other transaction information.
Please let us know if your use-case demands it by request this feature in an issue.

## Block Information

To get information about a block, the functions `getCurrentBlock` and `getBlock` can be used:

-
    ```cadence
    view fun getCurrentBlock(): Block
    ```

  Returns the current block, i.e. the block which contains the currently executed transaction.

-
    ```cadence
    view fun getBlock(at: UInt64): Block?
    ```

  Returns the block at the given height.
  If the block exists within the accessible range defined by `flow.DefaultTransactionExpiry - 10` (`590` blocks), it is returned successfully.
  If the block at the given height does not exist or is outside the default transaction expiration range of `590` blocks below the current sealed block, the function returns `nil`.

The `Block` type contains the identifier, height, and timestamp:

```cadence
access(all)
struct Block {
    /// The ID of the block.
    ///
    /// It is essentially the hash of the block.
    ///
    access(all)
    let id: [UInt8; 32]

    /// The height of the block.
    ///
    /// If the blockchain is viewed as a tree with the genesis block at the root,
    // the height of a node is the number of edges between the node and the genesis block
    ///
    access(all)
    let height: UInt64

    /// The view of the block.
    ///
    /// It is a detail of the consensus algorithm. It is a monotonically increasing integer
    /// and counts rounds in the consensus algorithm. It is reset to zero at each spork.
    ///
    access(all)
    let view: UInt64

    /// The timestamp of the block.
    ///
    /// Unix timestamp of when the proposer claims it constructed the block.
    ///
    /// NOTE: It is included by the proposer, there are no guarantees on how much the time stamp can deviate from the true time the block was published.
    /// Consider observing blocks’ status changes off-chain yourself to get a more reliable value.
    ///
    access(all)
    let timestamp: UFix64
}
```

