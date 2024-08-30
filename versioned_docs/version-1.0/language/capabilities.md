---
title: Capabilities
sidebar_position: 14
---

Cadence supports [capability-based security](https://en.wikipedia.org/wiki/Capability-based_security)
through the [object-capability model](https://en.wikipedia.org/wiki/Object-capability_model).

A capability in Cadence is a value that represents the right
to access an object and perform certain operations on it.
A capability specifies _what_ can be accessed, and _how_ it can be accessed.

Capabilities are unforgeable, transferable, and revocable.

Capabilities can be storage capabilities or account capabilities:
- **Storage capabilities** grant access to [objects in account storage](./accounts/storage.mdx),
via [paths](./accounts/paths.mdx)
- **Account capabilities** grant access to [accounts](./accounts/index.mdx)

Capabilities can be borrowed to get a [reference](./references.mdx) to the stored object or the account it refers to.

Capabilities have the type `Capability<T: &Any>`.
The type parameter specifies the kind of reference that can be obtained when borrowing the capability.
The type specifies the associated set of access rights through [entitlements](./access-control.md):
the reference type of the capability can be authorized,
which grants the owner of the capability the ability to access the fields and functions of the target
which require the given entitlements.

For example, a capability which has type `Capability<auth(SaveValue) &Account>`
grants access to an account, and allows saving a value into the account.

Each capability has an ID.
The ID is unique **per account/address**.

Capabilities are created and managed through [capability controllers](./accounts/capabilities.mdx).

Capabilities are structs, so they are copyable. 
They can be used (e.g. borrowed) arbitrarily many times, as long as the target capability controller has not been deleted.

## `Capability`

```cadence
access(all)
struct Capability<T: &Any> {
    
    /// The address of the account which the capability targets.
    access(all)
    let address: Address

    /// The ID of the capability.
    access(all)
    let id: UInt64

    /// Returns a reference to the targeted object.
    ///
    /// If the capability is revoked, the function returns nil.
    ///
    /// If the capability targets an object in account storage,
    /// and and no object is stored at the target storage path,
    /// the function returns nil.
    ///
    /// If the targeted object cannot be borrowed using the given type,
    /// the function panics.
    ///
    access(all)
    view fun borrow(): T?

    /// Returns true if the capability currently targets an object
    /// that satisfies the given type, i.e. could be borrowed using the given type.
    ///
    access(all)
    view fun check(): Bool
}
```
