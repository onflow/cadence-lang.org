---
title: Cadence Anti-Patterns
sidebar_position: 6
sidebar_label: Anti-Patterns
---

This is an opinionated list of issues that can be improved if they are found in Cadence code intended for production.

## Avoid using fully authorized account references as a function parameter

### Problem

A developer may choose to authenticate or perform operations for their users by using the users' account reference or addresses.
In order to do this, they might add a parameter to a function which has an authorized account reference type (`auth(...) &Account`),
as an authorized account reference can only be obtained by signing a transaction.

If it is a fully authorized account reference, this is problematic,
as the fully-authorized account reference allows access to some sensitive operations on the account,
for example, to write to storage, which provides the opportunity for bad actors to take advantage of.

### Example:

```cadence
...
// BAD CODE
// DO NOT COPY

// Imagine this code is in a contract that uses a `auth(Storage) &Account` parameter
// to authenticate users to transfer NFTs

// They could deploy the contract with an Ethereum-style access control list functionality

access(all)
fun transferNFT(id: UInt64, owner: auth(Storage) &Account) {
    assert(owner(id) == owner.address)

    transfer(id)
}

// But they could upgrade the function to have the same signature
// so it looks like it is doing the same thing, but they could also drain a little bit
// of FLOW from the user's vault, a totally separate piece of the account that
// should not be accessible in this function
// BAD

access(all)
fun transferNFT(id: UInt64, owner: auth(Storage) &Account) {
    assert(owner(id) == owner.address)

    transfer(id)

    // Sneakily borrow a reference to the user's Flow Token Vault
    // and withdraw a bit of FLOW
    // BAD
    let vaultRef = owner.borrow<&FlowToken.Vault>(/storage/flowTokenVault)!
    let stolenTokens <- vaultRef.withdraw(amount: 0.1)

    // deposit the stolen funds in the contract owners vault
    // BAD
    contractVault.deposit(from: <-stolenTokens)
}
...
```

### Solution

Projects should find other ways to authenticate users, such as using resources and capabilities as authentication objects.
They should also expect to perform most storage and linking operations within transaction bodies
rather than inside contract utility functions.

There are some scenarios where using an authorized account reference (`auth(...) &Account`) is necessary,
such as a cold storage multi-sig,
but those cases are rare and should only be used if it is a very restricted subset
of account functionality that is required.

## Public functions and fields should be avoided

### Problem

Be sure to keep track of access modifiers when structuring your code, and make public only what should be public.
Accidentally exposed fields can be a security hole.

### Solution

When writing your smart contract, look at every field and function and make sure
that require access through an [entitlement](./language/access-control.md#entitlements) (`access(E)`),
or use a non-public [access modifier](./language/access-control.md) like `access(self)`, `access(contract)`, or `access(account)`,
unless otherwise needed.

## Capability-Typed public fields are a security hole

This is a specific case of "Public Functions And Fields Should Be Avoided", above.

### Problem

The values of public fields can be copied. Capabilities are value types,
so if they are used as a public field, anyone can copy it from the field
and call the functions that it exposes.
This almost certainly is not what you want if a capability
has been stored as a field on a contract or resource in this way.

### Solution

For public access to a capability, place it in an accounts public area so this expectation is explicit.

## Public admin resource creation functions are unsafe

This is a specific case of "Public Functions And Fields Should Be Avoided", above.

### Problem

A public function on a contract that creates a resource can be called by any account.
If that resource provides access to admin functions then the creation function should not be public.

### Solution

To fix this, a single instance of that resource should be created in the contract's initializer,
and then a new creation function can be potentially included within the admin resource, if necessary.

### Example

```cadence
// Pseudo-code

// BAD
access(all)
contract Currency {

    access(all)
    resource Admin {

        access(all)
        fun mintTokens()
    }

    // Anyone in the network can call this function
    // And use the Admin resource to mint tokens
    access(all)
    fun createAdmin(): @Admin {
        return <-create Admin()
    }
}

// This contract makes the admin creation private and in the initializer
// so that only the one who controls the account can mint tokens
// GOOD
access(all)
contract Currency {

    access(all)
    resource Admin {

        access(all)
        fun mintTokens()

        // Only an admin can create new Admins
        access(all)
        fun createAdmin(): @Admin {
            return <-create Admin()
        }
    }

    init() {
        // Create a single admin resource
        let firstAdmin <- create Admin()

        // Store it in private account storage, so only the admin can use it
        self.account.storage.save(<-firstAdmin, to: /storage/currencyAdmin)
    }
}
```

## Do not modify smart contract state or emit events in public struct initializers

This is another example of the risks of having publicly accessible parts to your smart contract.

### Problem

Data structure definitions in Cadence currently must be declared as public so that they can be used by anyone.
Structs do not have the same restrictions that resources have on them,
which means that anyone can create a new instance of a struct without going through any authorization.

### Solution

Any contract state-modifying operations related to the creation of structs
should be contained in resources instead of the initializers of structs.

### Example

This used to be a bug in the NBA Top Shot smart contract, so we'll use that as an example.
Before, when it created a new play,
[it would initialize the play record with a struct,](https://github.com/dapperlabs/nba-smart-contracts/blob/55645478594858a6830e4ab095034068ef9753e9/contracts/TopShot.cdc#L155-L158)
which increments the number that tracks the play IDs and emits an event:

```cadence
// Simplified Code
// BAD
//
access(all)
contract TopShot {

    // The Record that is used to track every unique play ID
    access(all)
    var nextPlayID: UInt32

    access(all)
    struct Play {

        access(all)
        let playID: UInt32

        init() {

            self.playID = TopShot.nextPlayID

            // Increment the ID so that it isn't used again
            TopShot.nextPlayID = TopShot.nextPlayID + 1

            emit PlayCreated(id: self.playID, metadata: metadata)
        }
    }
}
```

This is a risk because anyone can create the `Play` struct as many times as they want,
which could increment the `nextPlayID` field to the max `UInt32` value,
effectively preventing new plays from being created. It also would emit bogus events.

This bug was fixed by
[instead updating the contract state in the admin function](https://github.com/dapperlabs/nba-smart-contracts/blob/master/contracts/TopShot.cdc#L682-L685)
that creates the plays.


```cadence
// Update contract state in admin resource functions
// GOOD
//
access(all)
contract TopShot {

    // The Record that is used to track every unique play ID
    access(all)
    var nextPlayID: UInt32

    access(all)
    struct Play {

        access(all)
        let playID: UInt32

        init() {
            self.playID = TopShot.nextPlayID
        }
    }

    access(all)
    resource Admin {

        // Protected within the private admin resource
        access(all)
        fun createPlay() {
            // Create the new Play
            var newPlay = Play()

            // Increment the ID so that it isn't used again
            TopShot.nextPlayID = TopShot.nextPlayID + UInt32(1)

            emit PlayCreated(id: newPlay.playID, metadata: metadata)

            // Store it in the contract storage
            TopShot.playDatas[newPlay.playID] = newPlay
        }
    }
}
```
