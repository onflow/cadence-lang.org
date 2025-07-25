---
title: Core Events
sidebar_position: 23
---

Core events are events emitted directly from the Flow Virtual Machine (FVM). The events have the same name on all networks and do not follow the standard naming (they have no address).

Refer to the [public key section] for more details on the information provided for account key events.

### Account Created

Event that is emitted when a new account gets created.

Event name: `flow.AccountCreated`

```cadence
access(all)
event AccountCreated(address: Address)
```

| Field     | Type      | Description                              |
| --------- | --------- | ---------------------------------------- |
| `address` | `Address` | The address of the newly created account |

### Account Key Added

Event that is emitted when a key gets added to an account.

Event name: `flow.AccountKeyAdded`

```cadence
access(all)
event AccountKeyAdded(
    address: Address,
    publicKey: PublicKey,
    weight: UFix64,
    hashAlgorithm: HashAlgorithm,
    keyIndex: Int
)
```

| Field           | Type            | Description                                    |
| --------------- | --------------- | ---------------------------------------------- |
| `address`       | `Address`       | The address of the account the key is added to |
| `publicKey`     | `PublicKey`     | The public key added to the account            |
| `weight`        | `UFix64`        | Weight of the new account key                  |
| `hashAlgorithm` | `HashAlgorithm` | HashAlgorithm of the new account key           |
| `keyIndex`      | `Int`           | Index of the new account key                   |

### Account Key Removed

Event that is emitted when a key gets removed from an account.

Event name: `flow.AccountKeyRemoved`

```cadence
access(all)
event AccountKeyRemoved(
    address: Address,
    publicKey: PublicKey
)
```

| Field       | Type      | Description                                        |
| ----------- | --------- | -------------------------------------------------- |
| `address`   | `Address` | The address of the account the key is removed from |
| `publicKey` | `Int`     | Index of public key removed from the account       |

### Account Contract Added

Event that is emitted when a contract gets deployed to an account.

Event name: `flow.AccountContractAdded`

```cadence
access(all)
event AccountContractAdded(
    address: Address,
    codeHash: [UInt8],
    contract: String
)
```

| Field      | Type      | Description                                              |
| ---------- | --------- | -------------------------------------------------------- |
| `address`  | `Address` | The address of the account the contract gets deployed to |
| `codeHash` | `[UInt8]` | Hash of the contract source code                         |
| `contract` | `String`  | The name of the contract                                 |

### Account Contract Updated

Event that is emitted when a contract gets updated on an account.

Event name: `flow.AccountContractUpdated`

```cadence
access(all)
event AccountContractUpdated(
    address: Address,
    codeHash: [UInt8],
    contract: String
)
```

| Field      | Type      | Description                                                       |
| ---------- | --------- | ----------------------------------------------------------------- |
| `address`  | `Address` | The address of the account where the updated contract is deployed |
| `codeHash` | `[UInt8]` | Hash of the contract source code                                  |
| `contract` | `String`  | The name of the contract                                          |

### Account Contract Removed

Event that is emitted when a contract gets removed from an account.

Event name: `flow.AccountContractRemoved`

```cadence
access(all)
event AccountContractRemoved(
    address: Address,
    codeHash: [UInt8],
    contract: String
)
```

| Field      | Type      | Description                                               |
| ---------- | --------- | --------------------------------------------------------- |
| `address`  | `Address` | The address of the account the contract gets removed from |
| `codeHash` | `[UInt8]` | Hash of the contract source code                          |
| `contract` | `String`  | The name of the contract                                  |

### Inbox Value Published

Event that is emitted when a Capability is published from an account.

Event name: `flow.InboxValuePublished`

```cadence
access(all)
event InboxValuePublished(provider: Address, recipient: Address, name: String, type: Type)
```

| Field       | Type      | Description                                  |
| ----------- | --------- | -------------------------------------------- |
| `provider`  | `Address` | The address of the publishing account        |
| `recipient` | `Address` | The address of the intended recipient        |
| `name`      | `String`  | The name associated with the published value |
| `type`      | `Type`    | The type of the published value              |

:::tip

To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.

:::

### Inbox Value Unpublished

Event that is emitted when a Capability is unpublished from an account.

Event name: `flow.InboxValueUnpublished`

```cadence
access(all)
event InboxValueUnpublished(provider: Address, name: String)
```

| Field      | Type      | Description                                  |
| ---------- | --------- | -------------------------------------------- |
| `provider` | `Address` | The address of the publishing account        |
| `name`     | `String`  | The name associated with the published value |

:::tip

To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.

:::

### Inbox Value Claimed

Event that is emitted when a Capability is claimed by an account.

Event name: `flow.InboxValueClaimed`

```cadence
access(all)
event InboxValueClaimed(provider: Address, recipient: Address, name: String)
```

| Field       | Type      | Description                                  |
| ----------- | --------- | -------------------------------------------- |
| `provider`  | `Address` | The address of the publishing account        |
| `recipient` | `Address` | The address of the claiming recipient        |
| `name`      | `String`  | The name associated with the published value |

:::tip

To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.

:::

<!-- Relative links. Will not render on the page -->

[public key section]: ./crypto.mdx#public-keys
