---
title: Cadence Security Best Practices
sidebar_label: Security Best Practices
sidebar_position: 7
---

This is an opinionated list of best practices that Cadence developers should follow to write more secure Cadence code.

Some practices listed below might overlap with advice in the [Cadence Anti-Patterns] article, which is a recommended read as well.

## Access Control

Do not use the `access(all)` modifier on fields and functions unless absolutely necessary. Prefer `access(self)`, `access(contract)`, `access(account)`, or `access(SomeEntitlement)`. Unintentionally declaring fields or functions as `access(all)` can expose vulnerabilities in your code.

When writing definitions for contracts, structs, or resources, start by declaring all your fields and functions as `access(self)`. If there is a function that needs to be accessible by external code, only declare it as `access(all)` if it is a `view` function:

```cadence
/// Simplified Bank Account implementation
access(all) resource BankAccount {

    /// Fields should default to access(self) to be safe
    /// and be readable through view functions
    access(self) var balance: UFix64

    /// It is okay to make this function access(all) because it is a view function
    /// and all blockchain data is public
    access(all) view fun getBalance(): UFix64 {
        return self.balance
    }
}
```

If there are any functions that modify state that also need to be callable from external code, use [entitlements] for the access modifiers for those functions:

```cadence
/// Simplified Vault implementation
/// Simplified Bank Account implementation
access(all) resource BankAccount {

    /// Declare Entitlements for state-modifying functions
    access(all) entitlement Owner
    access(all) entitlement Depositor

    /// Fields should default to access(self) just to be safe
    access(self) var balance: UFix64

    /// All non-view functions should be something other than access(all),
    
    /// This is only callable by other functions in the type, so it is `access(self)`
    access(self) fun updateBalance(_ new: UFix64) {
        self.balance = new
    }

    /// This function is external, but should only be called by the owner
    /// so we use the `Owner` entitlement
    access(Owner) fun withdrawFromAccount(_ amount: UFix64): @BankAccount {
        self.updateBalance(self.balance - amount)
        return <-create BankAccount(balance: amount)
    }

    /// This is also state-modifying, so it should also be restricted with entitlements
    /// In this case, we can use two entitlements to be more specific
    /// about who can access (Owner OR Depositor)
    access(Owner | Depositor) fun depositToAccount(_ from: @BankAccount) {
        self.updateBalance(self.balance + from.getBalance())
        destroy from
    }
}
```

## Access Control for Composite-typed Fields

Declaring a field as [`access(all)`] only protects from replacing the field's value, but the value itself can still be mutated if it is mutable. Remember that containers, like dictionaries and arrays, are mutable and composite fields like structs and resources are still mutable through their own functions.

:::danger

This means that if you ever have a field that is a resource, struct, or capability, it should ALWAYS be `access(self)`! If it is `access(all)`, anyone could access it and call its functions, which could be a major vulnerability.

You can still allow external code to access that field, but only through functions that you have defined with `access(SomeEntitlement)`. This way, you can explicitly define how external code can access these fields.

:::

# Capabilities

## Issuing Capabilities

Don't issue and publish capabilities unless absolutely necessary. Anyone can access capabilities that are published. If public access is needed, follow the [principle of least privilege/authority]: make sure that the capability type only grants access to the fields and functions that should be exposed, and nothing else. Ideally, create a capability with a reference type that is unauthorized.

When issuing a capability, a capability of the same type might already be present. It is a good practice to check if a capability already exists with `getControllers()` before creating it. If it already exists, you can reuse it instead of issuing a new one. This prevents you from overloading your account storage and overpaying because of redundant capabilities.

```cadence
    // Capability to find or issue
    var flowTokenVaultCap: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>? = nil

    // Get all the capabilities that have already been issued for the desired storage path
    let flowTokenVaultCaps = account.capabilities.storage.getControllers(forPath: /storage/flowTokenVault)

    // Iterate through them to see if there is already one of the needed type
    for cap in flowTokenVaultCaps {
        if let cap = cap as? Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault> {
            flowTokenVaultCap = cap
            break
        }
    }

    // If no capabilities of the needed type are already present,
    // issue a new one
    if flowTokenVaultCap == nil {
        // issue a new entitled capability to the flow token vault
        flowTokenVaultCap = account.capabilities.storage.issue<auth(FungibleToken.Withdraw) &FlowToken.Vault>(/storage/flowTokenVault)
    }
```

## Publishing Capabilities

When publishing a capability, a published capability might already be present. It is a good practice to check if a capability already exists with `borrow` before creating it. This function will return `nil` if the capability does not exist.

```cadence
// Check if the published capability already exists
if account.capabilities.borrow<&FlowToken.Vault>(/public/flowTokenReceiver) == nil {
    // since it doesn't exist yet, we should publish a new one that we created earlier
    signer.capabilities.publish(
        receiverCapability,
        at: /public/flowTokenReceiver
    )
}
```

## Checking Capabilities

If it is necessary to handle the case where borrowing a capability might fail, the `account.check` function can be used to verify that the target exists and has a valid type:

```cadence
// check if the capability is valid
if capability.check() {
    let reference = capability.borrow()
} else {
    // do something else if the capability isn't valid
}
```

## Capability Access

Ensure capabilities cannot be accessed by unauthorized parties. For example, capabilities should not be accessible through a public field, including public dictionaries or arrays. Exposing a capability in such a way allows anyone to borrow it and to perform all actions that the capability allows, including `access(all)` fields and functions that aren't even in the restricted type of the capability.

## References

[References] are ephemeral values and cannot be stored. If persistence is required, store a capability and borrow it when needed.

When exposing functionality in an account, struct, or resource, provide the least access necessary. When creating an authorized reference with [entitlements], create it with only the minimal set of [entitlements] required to achieve the desired functionality.

# Accounts

## Account storage

Don't trust a user's [account storage]. Users have full control over their data and may reorganize it as they see fit. Users may store values in any path, so paths may store values of _unexpected_ types. These values may be instances of types in contracts that the user deployed.

Always [borrow] with the specific type that is expected. Or, check if the value is an instance of the expected type.

## Authorized account references

Access to an authorized account reference (`auth(...) &Account`) gives access to entitled operations (e.g., the account's storage, keys, and contracts).

Therefore, avoid passing an entitled account reference to a function, and when defining a function, only specify an account reference parameter with the fine-grained entitlements required to perform the necessary operations.

It is preferable to use capabilities over direct account storage access when exposing account data. Using capabilities allows the revocation of access and limits the access to a single value with a certain set of functionality.

## Transactions

Audits of Cadence code should also include [transactions], as they may contain arbitrary code, just like in contracts. In addition, they are given full access to the accounts of the transaction's signers (i.e., the transaction is allowed to manipulate the signer's account storage, contracts, and keys).

Signing a transaction gives access to the operations accessible by the entitlements specified in the parameter types of the `prepare` block.

For example, the account reference type `auth(Storage) &Auth` is authorized to perform any storage operation.

When signing a transaction, audit which entitlements are requested.

When authoring a transaction, follow the [principle of least privilege/authority], and only request the least and most fine-grained account entitlements necessary to perform the operations of the transactions.

## Types

Use [intersection types and interfaces]. Always use the most specific type possible, following the principle of least privilege. Types should always be as restrictive as possible, especially for resource types.

If given a less-specific type, cast to the more specific type that is expected. For example, when implementing the fungible token standard, a user may deposit any fungible token, so the implementation should cast to the expected concrete fungible token type.

<!-- Relative links. Will not render on the page -->

[Cadence Anti-Patterns]: ./design-patterns.md
[References]: ./language/references.mdx
[account storage]: ./language/accounts/storage.mdx
[borrow]: ./language/capabilities.md#capabilities-in-accounts
[principle of least privilege/authority]: https://en.wikipedia.org/wiki/Principle_of_least_privilege
[transactions]: ./language/transactions.md
[principle of least privilege/authority]: https://en.wikipedia.org/wiki/Principle_of_least_privilege
[intersection types and interfaces]: ./language/types-and-type-system/intersection-types.md
[`access(all)`]: ./language/access-control.md
[entitlements]: ./language/access-control.md