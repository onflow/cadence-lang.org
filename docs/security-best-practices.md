---
title: Cadence Security Best Practices
sidebar_label: Security Best Practices
sidebar_position: 7
---

This is an opinionated list of best practices Cadence developers should follow to write more secure Cadence code.

Some practices listed below might overlap with advice in the [Cadence Anti-Patterns](./design-patterns.md) section, which is a recommended read as well.

## References

[References](./language/references.mdx) are ephemeral values and cannot be stored. If persistence is required, store a capability and borrow it when needed.

When exposing functionality, provide the least access necessary. When creating an authorized reference,
create it with only the minimal set of entitlements required to achieve the desired functionality.

## Account Storage

Don't trust a users' [account storage](./language/accounts/storage.mdx).
Users have full control over their data and may reorganize it as they see fit.
Users may store values in any path, so paths may store values of "unexpected" types.
These values may be instances of types in contracts that the user deployed.

Always [borrow](./language/accounts/capabilities.mdx) with the specific type that is expected.
Or, check if the value is an instance of the expected type.

## Authorized account references

Access to an authorized account reference (`auth(...) &Account`) gives access to entitled operations,
for example the account's storage, keys, and contracts.

Therefore, avoid passing an entitled account reference to a function,
and when defining a function,
only specify an account reference parameter with the fine-grained entitlements required to perform the necessary operations.

It is preferable to use capabilities over direct account storage access when exposing account data.
Using capabilities allows the revocation of access and limits the access to a single value with a certain set of functionality.

## Capabilities

Don't issue and publish capabilities unless really necessary.
Anyone can access capabilities that are published.
If public access is needed, follow the [principle of least privilege/authority](https://en.wikipedia.org/wiki/Principle_of_least_privilege):
Make sure that the capability type only grants access to the fields and functions that should be exposed, and nothing else.
Ideally, create a capability with a reference type that is unauthorized.

If an entitlement is necessary to access the field or function,
ensure it is only used for the particular field or function,
and not also by other fields and functions.
If needed, introduce a new, fine-grained entitlement.

When publishing a capability, a capability might already be present.
It is a good practice to check if a capability already exists with `get` before creating it.
This function will return `nil` if the capability does not exist.

If it is necessary to handle the case where borrowing a capability might fail, the `account.check` function can be used to verify that the target exists and has a valid type.

Ensure capabilities cannot be accessed by unauthorized parties. For example, capabilities should not be accessible through a public field, including public dictionaries or arrays. Exposing a capability in such a way allows anyone to borrow it and perform all actions that the capability allows.

## Transactions

Audits of Cadence code should also include [transactions](./language/transactions.md), as they may contain arbitrary code, just, like in contracts. In addition, they are given full access to the accounts of the transaction’s signers, i.e. the transaction is allowed to manipulate the signers’ account storage, contracts, and keys.

Signing a transaction gives access to the operations accessible by the entitlements specified in the parameter types of the `prepare` block.

For example, the account reference type `auth(Storage) &Auth` is authorized is perform any storage operation.

When signing a transaction, audit which entitlements are requested.

When authoring a transaction,
follow the [principle of least privilege/authority](https://en.wikipedia.org/wiki/Principle_of_least_privilege),
and only request the least and most fine-grained account entitlements necessary to perform the operations of the transactions.

## Types

Use [intersection types and interfaces](./language/intersection-types.md). Always use the most specific type possible, following the principle of least privilege. Types should always be as restrictive as possible, especially for resource types.

If given a less-specific type, cast to the more specific type that is expected. For example, when implementing the fungible token standard, a user may deposit any fungible token, so the implementation should cast to the expected concrete fungible token type.

## Access Control

Declaring a field as [`access(all)`](./language/access-control.md) only protects from replacing the field’s value, but the value itself can still be mutated if it is mutable. Remember that containers, like dictionaries, and arrays, are mutable.

Prefer non-public access to a mutable state. That state may also be nested. For example, a child may still be mutated even if its parent exposes it through a field with non-settable access.

Do not use the `access(all)` modifier on fields unless necessary.
Prefer `access(self)`, or `access(contract)` and `access(account)` when other types in the contract or account need to have access,
and entitlement-based access for other cases.
