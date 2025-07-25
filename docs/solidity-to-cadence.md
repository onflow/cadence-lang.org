---
title: Cadence Guide for Solidity Developers
sidebar_label: Cadence Guide for Solidity Developers
sidebar_position: 3
---

Cadence introduces a different way to approach smart contract development, which may feel unfamiliar to Solidity developers. There are fundamental mindset and platform differences, and also several new language features that have no real equivalent in Solidity. As a result, while you can make similar programs in Cadence as you could in Solidity, a direct translation from one to the other isn't possible - similar to how you could make a note-taking app in C or in JavaScript, but it wouldn't be possible to directly translate the C code into JavaScript. You'd have to write an entirely new program for a new paradigm.

This guide outlines high level design and conceptual aspects of Flow and Cadence that are essential to understand, platform and integration differences, as well as detailed guidance on how to perform certain common Solidity development tasks using Cadence idioms. We also provide details on how to best leverage Cadence's unique features and how to avoid common pitfalls that may come up while transitioning.

## Conceptual foundations for Cadence

A fundamental difference to get used to when adjusting to Cadence from Solidity is **mindset**. Security and interoperability on Ethereum are designed around addresses (or more specifically, the account associated with an address), resulting in all contracts having to carefully track and evaluate access and authorizations.

![Ethereum Ownership](ethereum-ownership.png)

Transactions are based on who authorized them, which is provided as `msg.sender` in the transaction context. User-to-contract, or contract-to-contract interactions, must be explicitly coded **in the contract and in advance** to ensure the appropriate approvals have been made before interacting with a contract. The contract-based nature of storage means that user ownership in Ethereum is represented in a mapping (e.g., from owner to balance or token ID to owner). Put another way, ownership is tracked in ledger records similar to a person's bank balance. Crypto wallets help combine balances from multiple token types into a convenient view for the user.

Cadence introduces new primitives and distinct functionalities, namely [Resources] and [Capabilities], that are designed around Flow's account model. Resources are first-class language types, which are unique, non-copyable, and cannot be discarded. These properties make resources ideal for representing digital assets like currency or tokens that are always limited in number. Resources are always stored in account storage, and contracts control access to them using capabilities. Capabilities are another special type that secures protected resources without the need for tracking addresses. Cadence makes working with these straightforward and intuitive to those familiar with object-oriented programming languages.

### Scripts and transactions

One of the most important (and powerful!) difference between Cadence and Solidity is that deployed contracts are not the only code being executed in the VM. Cadence offers scripts and transactions, which are written in Cadence and always exist offchain. However, they are the top-level code payload being executed by the execution runtime. Clients send scripts and transactions through the Flow Access API gRPC or REST endpoints, returning results to clients when applicable.

Scripts and transactions enable more efficient and powerful ways to integrate dapps with the underlying blockchain, where contracts can more purely be thought of as services or components, with scripts or transactions becoming the dapp-specific API interface for chain interactions.

What this means is that you **don't have to predict the future** when writing your contracts and your **views aren't limited to functions in the contract**. Even more importantly, you can **write transactions that call multiple functions with multiple deployed contracts that you don't need to own** and are signed with one signature.

Scripts are read-only in nature, requiring only a `main` function declaration that performs [queries] against a chain state. For example:

```jsx
// This script reads the balance field of an account's ExampleToken Balance
import FungibleToken from "../../contracts/FungibleToken.cdc"
import ExampleToken from "../../contracts/ExampleToken.cdc"

access(all)
fun main(account: Address): UFix64 {
    let acct = getAccount(account)
    let vaultRef = acct.capabilities
        .borrow<&ExampleToken.Vault>(ExampleToken.VaultPublicPath)
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
```

[Transactions] are an Atomic, Consistent, Isolated, and Durable (ACID) version of scripts having only `prepare` and `execute` functions that either succeed in full and mutate the chain state as described, or otherwise fail and mutate nothing. They also support a setting of `pre` and `post` conditions. In the following transaction example, `ExampleToken`s are deposited into multiple `receiver` vaults for each address in the input map:

```jsx
import FungibleToken from "../contracts/FungibleToken.cdc"
import ExampleToken from "../contracts/ExampleToken.cdc"

/// Transfers tokens to a list of addresses specified in the `addressAmountMap` parameter
transaction(addressAmountMap: {Address: UFix64}) {

    // The Vault resource that holds the tokens that are being transferred
    let vaultRef: auth(FungibleToken.Withdraw) &ExampleToken.Vault

    prepare(signer: auth(BorrowValue) &Account) {

        // Get a reference to the signer's stored ExampleToken vault
        self.vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &ExampleToken.Vault>(
            from: ExampleToken.VaultStoragePath
       )     ?? panic("The signer does not store an ExampleToken.Vault object at the path "
                    .concat(ExampleToken.VaultStoragePath.toString())
                    .concat(". The signer must initialize their account with this vault first!"))
    }

    execute {

        for address in addressAmountMap.keys {

            // Withdraw tokens from the signer's stored vault
            let sentVault <- self.vaultRef.withdraw(amount: addressAmountMap[address]!)

            // Get the recipient's public account object
            let recipient = getAccount(address)

            // Get a reference to the recipient's Receiver
            let receiverRef = recipient.capabilities
                .borrow<&{FungibleToken.Receiver}>(ExampleToken.ReceiverPublicPath)
                ?? panic("Could not borrow receiver reference to the recipient's Vault")

            // Deposit the withdrawn tokens in the recipient's receiver
            receiverRef.deposit(from: <-sentVault)

        }
    }
}
```

Transactions can encompass an arbitrary number of withdrawals/deposits across multiple FTs, sending to multiple addresses or other more complex variations, all of which will succeed or fail in their entirety given their ACID properties.

## Flow account model

The [Flow account model] in Cadence combines storage for the keys and code ("smart contracts") associated with an account with storage for the assets owned by that account. That's right — in Cadence, your tokens are stored in your account, and not in a smart contract. Of course, smart contracts still define these assets and how they behave, but those assets can be securely stored in a user's account through the magic of Resources:

![Account Structure](account-structure.png)

There is only one account type in Cadence that uses an account address, similar to an Externally-Owned-Account (EOA) address in Ethereum. Unlike Ethereum contracts, Cadence accounts directly store contract code. Accounts realize ownership on Flow by being the container where keys, resources, and contracts are stored onchain.

## Account

`Account` is the type that provides access to an account.

The `getAccount` function allows you to get access to the publicly available functions and fields of an account. For example, this allows querying an account's balance.

An authorized `Account` reference provides access and allows the management of the account's storage, key configuration, and contract code. An authorized `Account` reference can only be acquired by signing a transaction. Capabilities ensure that resources held in an account can be safely shared and accessed.

## Resources

Resources are unique, [linear types] that can never be copied or implicitly discarded, and can only be moved between accounts. Static checks during development flag an error for a failure to store a resource moved from an account if that resource is not appropriately moved back into storage for a same or new account, or explicitly destroyed. The run-time enforces the same strict rules in terms of allowed operations. Therefore, contract functions that do not properly handle resources in scope before exiting will abort, reverting the resource to the original storage. These features of resources make them perfect for representing tokens, both fungible and non-fungible. Ownership is tracked by where they are stored, and the assets can't be duplicated or accidentally lost since the language itself enforces correctness.

Flow encourages the storage of data and compute onchain and resource-types makes this easier than ever. Since resources are always stored in accounts, any data and code that exists in resource instances is seamlessly managed onchain without any explicit handling needed.

## Capability-based access

Remote access to stored objects is managed via [Capabilities]. This means that if an account wants to be able to access another account's stored objects, it must have been provided with a valid capability to that object. Capabilities can be either public or private. An account can share a public capability if it wants to give all other accounts access. For example, it's common for an account to accept fungible token deposits from all sources via a public capability. Alternatively, an account can grant private capabilities to specific accounts in order to provide access to restricted functionality. For example, a non-fungible token (NFT) project often controls minting through an "administrator capability" that grants specific accounts the power to mint new tokens.

## Contract standards

There are numerous widely-used contract standards established to benefit the ecosystem. For example, [Fungible Token] (FT) and [Non-Fungible Token] (NFT) are standards that are conceptually equivalent to Ethereum's ERC-20 and ERC-721 standards. Cadence's object-oriented design means standards apply through contract sub-types such as resources, resource interfaces, or other types declared in the contract standard. Standards can define and limit behavior and/or set conditions that implementations of the standard cannot violate.

Detailed information about available standards and other core contracts can be found in the [Introduction to Flow].

### NFT standard and metadata

Solidity must manage NFT metadata offchain, and NFTs frequently link to IPFS-hosted JSON from onchain.

The Cadence NFT standard provides built-in support for metadata with specific types called [views]. Views can be added to NFTs when minted and will always be available as part of the NFT. While metadata is stored onchain, graphics and video content are stored offchain. Cadence provides [utility views] for both HTTP- and IPFS-based media storage, which remain linked to your NFT.

Using NFT metadata views is a requirement to get listed in the [Flow NFT Catalog]. Projects are encouraged to leverage the NFT catalog since wallets and other ecosystem partners can seamlessly integrate new collections added there with no input from project creators.

NFT metadata on Flow opens the door to exciting new possibilities that help builders innovate. Check out this recent [case study] where a community partner leveraged SVG-based metadata to make combined 2D + 3D versions of their PFPs, all onchain inside the NFTs' metadata!

Under most circumstances, NFTs bridged via the [Cross-VM Bridge] from Flow Cadence to Flow EVM will automatically be provided with

## Security and access control

Decentralized application development places significant focus on security and access, which can fairly be described as security engineering. Understanding how resources, capabilities, and the account model solve this may not be obvious when viewed from a Solidity perspective.

### msg.sender considered harmful

The first question that every Solidity developer asks when they start programming in Cadence is:

**_How do I get the account that authorized the transaction?_**

In Ethereum, this account is referred to as `msg.sender` and it informs the program flow in a function depending on who authorized it. Doing so is key to access and security, and is the basis of identity and ownership on Ethereum.

Cadence does not support `msg.sender`, and there is no transaction-level way for Cadence code to uniquely identify the calling account. Even if there was a way to access it, Cadence supports [multi-sig] transactions, meaning that a list of all the signers' accounts would be returned, making it impossible to identify a single authorizer.

The reason `msg.sender` is both unsupported and strongly advised against is that Cadence uses capabilities for access rather than addresses. The mindset change that developers need to adjust to is that a capability must first be obtained by the authorizing account (called the provider or signer in Cadence) from the contract that will require it, which then enables the requesting account to access the protected function or resource. This means the contract never needs to know who the signer is before proceeding because the capability **IS** the authorization.

In EVM, the contract grants access to an address or addresses, thus it must know and operate based on the address of the signer:

![Access-Based Security](access-based-security.png)

The [capability-based security] model of Cadence frames access in the opposite direction from the [access-based security] model. Accounts are granted and store the capability to access and use functionality on the contract:

![Capability-Based Security](capability-based-security.png)

### Access control using capabilities

Solidity lacks specific types or other primitives to aid with permission management. Developers must inline guards to `require` at every function entry point, thus validating the `msg.sender` of the transaction.

[Capabilities] are defined by linking storage paths (namespaces for contract storage) to protected objects and then making that linked capability available to other accounts.

Any account can get access to an account's public capabilities. Public capabilities are created using public paths (i.e., they have the domain `public`). For example, all accounts have a default public capability linked to the `FlowToken.Vault` resource. This vault is exposed as a public [unentitled] capability, allowing any account to `borrow()` a reference to the Vault to make a `deposit()`. Since only the unentitled functions defined under the [`FungibleToken.Vault`] interface are exposed, the borrower of the vault reference cannot call `withdraw()`, since the method requires a `Withdraw` entitled reference on the underlying vault.

Accounts can share private capabilities, but must be specifically issued by the authorizing account. After [issuing], they can be obtained from authorized account objects (`Account`) but not public accounts (`PublicAccount`). To share a private capability with another account, the owning account must `publish` it to another account, which places it in the [account inbox] (not to be mistaken with `capabilities publish`). The recipient can later claim the capability from the account inbox using the `claim` function.

Public Capabilities can be `unpublished` and any capability can also be [revoked] by the creating account.

To aid automation, events are emitted for completed `publish`, `claim`, and `unpublish` actions for a Capability.

Detailed information can be found in [Capabilities].

### Hygiene factors for protecting value

While capabilities grant account access to a protected resource, it's still necessary to impose controls on the value accessed through them. For example, if your use case requires delegating access to a `FlowToken.Vault` to `withdraw()` funds, it's important to limit the amount. Tokens implementing FT/NFT standards are the primary type of value being exchanged by accounts on Flow. The standard provides the primitives needed to implement capability-limiting best practices.

**Token isolation**

All FTs reside in a `Vault` resource, and each different FT will exist as a separate `Vault` in an account. Similarly, all NFTs implement a `Collection` resource, in which those NFTs held by an account for that collection are stored.

Whenever access to the `withdraw()` function has to be delegated to another account, the simplest way to limit how many tokens of a given type can be withdrawn is to create a new `Vault` resource for that token type and move a smaller amount of the tokens in the main token `Vault`. A capability is then linked to that `Vault` instance before being made available to another account.

A similar pattern can be used for NFTs, where a new `Collection` resource can be created into which only those NFTs that should be exposed are moved. A capability is then linked to that `Collection` instance before being made available to another account.

**Bespoke control strategies**

For more complex use cases, you can create a new resource that implements the relevant interfaces to match those of the protected resource(s) that it wraps. The code for the new resource can then enforce limits as required and control how and when a delegation to the underlying resource occurs. One such example is the community-developed [`ScopedFTProviders`] and [`ScoptedNFTProviders`] utility contracts.

### Admin roles

Compared to Solidity, creating an admin role in Cadence requires a little more code, all of which is encapsulated within a resource. The admin object design can be highly customized and employ capabilities and [entitlements] for fine-grained control, such as limiting access to individual functions, on a per-account basis if required. The complexity needed for admin roles may vary — for example, larger organizations may require more complex role-based-access schemes. The use of a resource in this context is key — the instance can't be copied, and the account with the first edition mint of the admin serves as the root admin. The admin can be implemented to mint additional admin resource instances, which only the root-admin can grant to selected user accounts via a capability. Conveniently, because the admin role is only accessible via a capability, it's easy to manage with [Capability Revocation].

The admin role originates from the [init singleton pattern] and uses the [Capability Bootstrapping] pattern for making the Capability available to other accounts.

An example admin role implementation is available in the [Cadence cookbook].

### Role-based access

Implementing role-based access can be achieved by defining roles as resources managed by the root-admin account. Roles can provide limited access to functions, which guard other protected resources that include access levels and/or what is exposed, varying from role to role. The root admin can grant accounts access to individual roles through a private capability. Functions that the roles are permitted to invoke may be scoped as `access(contract)` to enforce that they can only be called by code paths in the root-admin contract.

## Other best practices and conventions

Certain well-established best practices for Solidity may not apply or are handled differently.

### Check effects interactions

Solidity contracts must use the [check effect interaction] because functions are public by default and address-based access means that guards must exist when program flow concedes control to an external contract. There are two reasons why this is significantly less of a problem in Cadence. Functions are private by default, and the language provides a range of [access scopes]. More importantly, _risks associated with ceding control to an external contract_ is an Ethereum phenomenon; the risk no longer applies. This is primarily because Cadence contracts are not static singletons, so control is never lost to another contract during the scope of a transaction.

### Guard check

Solidity uses `revert`, `require`, and `assert` to validate inputs. `require` is a product of the address-based nature of Solidity, which capabilities replace. `revert` is similar to Cadence's `panic` in that a transaction is aborted. Cadence provides an `assert` operator, which mirrors `assert` in Solidity.

### Modifiers

Modifiers are extensively used in Solidity when enforcing pre-checks within a function. This is a powerful language feature. However, modifiers can also mutate a state, which introduces risks to the program control flow.

Cadence uses `pre` and `post` blocks to validate input values or the function execution outputs. Notably, a `pre` and `post` block prohibits the changing of a state and may only enforce conditions.

Another difference is that modifiers in Solidity can be reused within the contract multiple times. Cadence `pre` and `post` blocks are associated with individual functions only, reducing the likelihood of errors but resulting in a small amount of code duplication.

### Error handling

Solidity offers a try/catch block to handle errors; however, there is presently no equivalent in Cadence.

## Integration differences

There are a few notable integration differences between Cadence and Solidity, which are described in the following sections.

### Contract imports and dynamic contract borrowing

Contracts in Ethereum are similar to static singletons in that interactions happen directly between users and the functions declared on the contract instance itself. The object-oriented nature of Cadence means that contracts are more accurately viewed as imported dependencies. The imported contract makes its object graph available for the code at runtime. Rather than interacting with a contract singleton instance, account interactions to access capabilities are the primary integration entry point, allowing the user to interact with the returned objects.

Dynamic borrowing of a contract inlines the loading of a contract based on its contract address. The loaded contract can be cast to the contract standard interface to which it conforms to (e.g., NFT standard) and then interacted with in the same way if it were statically imported. Consider the implications of this for the composability of contracts.

Detailed information about deploying, updating, removing, or borrowing contracts can be found in [Contracts].

### Multi-key, multi-signature support

Solidity supports only one kind of multi-signature scheme where `n` out of `m` (assuming `m >= n`) approvals need to be obtained to execute the transaction from the multi-signature smart contract. The most used multi-signature smart contract in the Ethereum ecosystem is the Gnosis [safe contract]. However, Solidity lacks support for signature aggregation or BLS signature schemes.

Cadence offers a wide range of options to implement various multi-signature schemes, including:

- Inherent support for multi-sign transactions.
- Resource transfer scheme.
- Inherent support of the BLS signature scheme.

Flow account keys have assigned weights, where a 1000 unit weight is the cumulative weight needed from signing keys to execute a transaction successfully. One can divide weights arbitrarily across multiple keys and distribute those partial weighted keys to authorized signers. When signing the transaction, all signers must sign the transaction together in a short period of time in order for the cumulative weight to reach 1000 units.

See the [BLS Signature scheme] for a detailed overview of the inherent support of BLS signatures.

**Resource transfer scheme**

The main limitation of multi-signature transactions is that signatures must all be made for the transaction within a relatively short time window. If this window is missed, the transaction will abort. The resource transfer scheme is very similar to the Solidity multi-signature smart contract. A resource is created that has the functionality to proxy the execution of a fund transfer. This resource is handed from one signer to the next to collect signatures. Once the threshold of required signatures is met, the transaction is executed. The main drawback with this approach is that it does not support the execution of arbitrary functionality.

## Other platform differences

The following differences, which are unrelated to implementing Cadence contracts, are useful to understand in the context of application design.

### Events

Flow uses [events] extensively to provide real-time signals to offchain systems about particular actions that occurred during a transaction. The main difference in Flow is that events remain part of the history and are not purged from storage. Events can be populated with arbitrary data that will assist consumers of the event. Builders are encouraged to leverage events for seamless UX as users perform transactions.

### Contract upgradeability

Flow supports limited upgradability of Cadence contracts, which is most helpful during development. The following function shows how an account owner can update a contract:

```solidity
fun update(name: String, code: [UInt8]): DeployedContract
```

Upgrades are analyzed for prohibited changes once uploaded for an upgrade. Upgradeability is still an early-phase feature, which will continue to improve over time.

To enforce immutability once a contract is tested and ready to deploy, account owners can optionally revoke keys from the account containing the contract.

Detailed information about the cadence upgradeability is available in [Contract Updatability].

### Account key formulation

In EVM-based chains, an address is derived from a cryptographically generated public key and can have a single private key, supporting one type of signature curve (i.e., ECDSA). They are not verifiable offchain and typos/truncation in an address may result in funds being lost.

Flow account addresses have a special format and are verifiable offchain. Verifying address format validity can be done using an error detection algorithm based on linear code. While this does not also confirm that an address is active onchain, the extra verifiability is a useful safeguard.

### Contract size constraints

Solidity developers will be well aware of the [EIP-170] deployable contract bytecode size limit of 24KB. This can burden builders who need to optimize contract bytecode size, sometimes even requiring a re-design of contracts to break it into smaller contract parts.

By contrast, Cadence has no inherent or defined smart contract size limit. However, it is restricted by the transaction size limit, which is 1.5MB. With very rare exceptions, it's unlikely that this limit would pose a problem to those developing Cadence contracts. Should it be needed, there is a known way to deploy a contract exceeding 1.5MB, which we will document at a later time.

## Low-level language differences

There are several language differences between Solidity and Cadence, which are described in the following sections.

### Arithmetic

Historically, Solidity, smart contracts lost millions of dollars because of improper handling of arithmetic under/overflows. Contemporary Solidity versions offer inbuilt handling of under/overflow for arithmetic operations.

Cadence implements [saturating math], which avoids overflow/underflow.

### Optional support

[Optional binding] provides built-in conditional handling of nil values. Regular data types in Cadence must always have a value and cannot be nil. Optionals enable variables or constants that might contain a certain type or a nil value. Optional bindings have two cases: either there is a value or there is nothing — they fork program flow similar to `if nil; else; end;`.

### Iterable dictionaries

Solidity offers the mapping type, however it is not iterable. Because of that, dapp developers have to maintain offchain tracking to have access to keys. This also pushes builders to create custom data types like `EnumerableMap`, which adds to gas costs.

Cadence offers the [Dictionary] type, an unordered collection of key-value associations, which is iterable.

### Rich support for type utility functions

Cadence offers numerous native-type utility functions to simplify development. For example, the String type provides:

- `utf8`
- `length`
- `concat()`
- `slice()`
- `split()`
- `replaceAll()`
- `join()`
- `decodeHex()`
- `encodeHex()`
- `fromCharacters()`
- `fromUTF8()`
- `toLower()`

### Argument labelling

Argument labels in Cadence help to disambiguate input values. They make code more readable and explicit. They also eliminate confusion around the order of arguments when working with the same type. They must be included in the function call, but this restriction can be skipped if the label is preceded by `_ ` on its declaration.

For example:

- if `fun foo(balance: UFix64)`, which is called as `self.foo(balance: 30.0)`
- then, `fun foo( _balance: UFix64)` can be called as `self.foo(balance: 30.0)` or as `self.foo(30.0)`.

One thing to note about argument labelling is that function overloading is not currently supported in Cadence. This means that functions with the same name but different argument labels are not allowed, which is an available feature in Solidity.

### Additional resources

- [On-Chain Token Transfer Deep Dive] — Cadence or Solidity
- [Bored Ape Yacht Club] — Implementing a smart contract in Cadence
- [Comparing AA on Ethereum vs Flow] — Quicknode's account abstraction on the Flow blockchain

<!-- Relative links. Will not render on the page -->

[Resources]: ./language/resources.mdx
[`FungibleToken.Vault`]: https://github.com/onflow/flow-ft/blob/master/contracts/FungibleToken.cdc#L167
[`ScopedFTProviders`]: https://github.com/green-goo-dao/flow-utils/blob/main/contracts/ScopedFTProviders.cdc
[`ScoptedNFTProviders`]: https://github.com/green-goo-dao/flow-utils/blob/main/contracts/ScopedNFTProviders.cdc
[access scopes]: ./language/access-control.md
[access-based security]: https://en.wikipedia.org/wiki/Access-control_list
[account inbox]: ./language/accounts/inbox.mdx
[BLS Signature scheme]: ./language/crypto.mdx#bls-multi-signature
[Bored Ape Yacht Club]: https://flow.com/post/implementing-the-bored-ape-yacht-club-smart-contract-in-cadence
[Cadence cookbook]: https://cookbook.onflow.org/?preview=13
[Capabilities]: ./language/capabilities.md
[Capability Bootstrapping]: ./design-patterns.md#capability-bootstrapping
[Capability Revocation]: ./design-patterns.md#capability-revocation
[capability-based security]: https://en.wikipedia.org/wiki/Capability-based_security
[case study]: https://flow.com/post/flovatar-nft-flow-blockchain-case-study
[Cross-VM Bridge]: https://developers.flow.com/tutorials/cross-vm-apps/vm-bridge
[check effect interaction]: https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html
[Comparing AA on Ethereum vs Flow]: https://www.quicknode.com/guides/other-chains/flow/account-abstraction-on-flow#account-abstraction-on-ethereum-vs-flow
[Contract Updatability]: ./language/contract-updatability
[Contracts]: ./language/contracts.mdx
[Dictionary]: ./language/control-flow.md
[EIP-170]: https://eips.ethereum.org/EIPS/eip-170
[entitlements]: ./language/access-control.md#entitlements
[events]: ./language/events.md
[Flow account model]: https://developers.flow.com/build/basics/accounts.md
[Flow NFT Catalog]: https://www.flow-nft-catalog.com/
[Fungible Token]: https://developers.flow.com/build/flow.md#flow-token
[init singleton pattern]: ./design-patterns.md#init-singleton
[Introduction to Flow]: https://developers.flow.com/build/flow.md
[issuing]: ./language/accounts/capabilities.mdx#issuing-capabilities
[linear types]: https://en.wikipedia.org/wiki/Substructural_type_system#Linear_type_systems
[multi-sig]: #multi-key-multi-signature-support
[Non-Fungible Token]: https://developers.flow.com/build/flow.md#overview
[On-Chain Token Transfer Deep Dive]: https://flow.com/engineering-blogs/flow-blockchain-programming-language-smart-contract-cadence-solidity-comparison-ethereum
[Optional binding]: ./language/control-flow.md#optional-binding
[queries]: https://github.com/onflow/flow-ft/blob/master/transactions/scripts/get_balance.cdc
[revoked]: ./design-patterns.md#capability-revocation
[safe contract]: https://github.com/safe-global/safe-contracts/blob/main/contracts/Safe.sol
[saturating math]: https://en.wikipedia.org/wiki/Saturation_arithmetic
[Transactions]: https://github.com/onflow/flow-ft/tree/master/transactions
[unentitled]: ./language/access-control.md#entitlements
[utility views]: https://developers.flow.com/build/flow.md
[views]: https://developers.flow.com/build/flow.md
