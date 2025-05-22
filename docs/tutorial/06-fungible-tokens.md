---
archived: false
draft: false
title: Fungible Tokens
description: An introduction to Fungible Tokens in Cadence
date: 2024-09-18
meta:
  keywords:
    - tutorial
    - Flow
    - Fungible Tokens
    - Cadence
    - Resources
    - Capabilities
tags:
  - reference
  - Fungible Token
  - cadence
  - tutorial
socialImageTitle: Fungible Tokens in Cadence
socialImageDescription: FT social image.
---

Some of the most popular contract classes on blockchains today are fungible tokens. These contracts create homogeneous tokens that can be transferred to other users and spent as currency (e.g., ERC-20 on Ethereum).

In traditional software and smart contracts, balances for each user are tracked by a central ledger, such as a dictionary:

```solidity
// Solidity Example
// SIMPLIFIED ERC20 EXAMPLE. DO NOT USE THIS CODE FOR YOUR PROJECT
contract LedgerToken {
    mapping (address => uint) public balances;
    uint public supply;

    function transfer(address _to, uint _amount) public {
        require(_balances[msg.sender] >= amount, "Insufficent funds");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
    }
}
```

```cadence
// Cadence Example
// BAD CODE EXAMPLE. DO NOT USE THIS CODE FOR YOUR PROJECT
contract LedgerToken {
    // Tracks every user's balance
    access(contract) let balances: {Address: UFix64}

    // Transfer tokens from one user to the other
    // by updating their balances in the central ledger
    access(all)
    fun transfer(from: Address, to: Address, amount: UFix64) {
        balances[from] = balances[from] - amount
        balances[to] = balances[to] + amount
    }
}
```

This is an **immensely dangerous** pattern — all the funds are stored in one account, the contract itself, which means that they can all be stolen at once if a vulnerability is found.

With Cadence, we use the new resource-oriented paradigm to implement fungible tokens and avoid using a central ledger, because there are inherent problems with using a central ledger that are detailed in the [Fungible Tokens section below].

:::warning

This tutorial implements a working fungible token, but it has been simplified for educational purposes and is not what you should use in production.

If you've found this tutorial looking for information on how to implement a real token, see the [Flow Fungible Token standard] for the standard interface and example implementation, and the [Fungible Token Developer Guide] for details on creating a production-ready version of a Fungible Token contract.

:::

In this tutorial, we're going to deploy, store, and transfer fungible tokens.

## Objectives

After completing this tutorial, you'll be able to:

- Compare and contrast how tokens are stored in Flow Cadence compared to Ethereum.
- Utilize the `UFix64` type to allow decimals without converting back and forth with 10^18.
- Implement a vault [resource] to manage the functionality needed for fungible tokens.
- Use [interfaces] to enforce the presence of specified functions and fields.
- Write transactions to transfer tokens safely from one account to another.
- Develop scripts to read account balances.
- Use preconditions and postconditions to perform checks before or after a function call completes.

## Flow network token

In Flow, the [native network token (FLOW)] is implemented as a normal fungible token smart contract using a smart contract similar to the one you'll build in this tutorial - with all the features and properties found in the [Fungible Token Developer Guide].

There are special transactions and hooks that allow it to be used for transaction execution fees, storage fees, and staking, but besides that, developers and users are able to treat it and use it just like any other token in the network!

## Fungible tokens on Flow

Flow Cadence implements fungible tokens differently than other blockchains. As a result:

- Ownership is decentralized and does not rely on a central ledger.
- Bugs and exploits present less risk for users and less opportunity for attackers.
- There is no risk of integer underflow or overflow.
- Assets cannot be duplicated, and it is very hard for them to be lost, stolen, or destroyed.
- Code can be composable.

### Fungible tokens on Ethereum

The following example showcases how Solidity (the smart contract language for the Ethereum Blockchain, among others) implements fungible tokens, with only the code for storage and transferring tokens shown for brevity.

```solidity ERC20.sol
// Solidity Example
// SIMPLIFIED ERC20 EXAMPLE. DO NOT USE THIS CODE FOR YOUR PROJECT
contract LedgerToken {
    mapping (address => uint) public balances;
    uint public supply;

    function transfer(address _to, uint _amount) public {
        require(_balances[msg.sender] >= amount, "Insufficent funds");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
    }
}
```

As you can see, Solidity uses a central ledger system for its fungible tokens. There is one contract that manages the state of the tokens, and every time that a user wants to do anything with their tokens, they must interact with the central ERC20 contract. This contract handles access control for all functionality, implements all of its own correctness checks, and enforces rules for all of its users.

If there's a bug, such as accidentally making the `_transfer` function accessible to the wrong user, a [reentrancy] issue, or another bug, an attacker can immediately exploit the entire contract and the tokens owned by all users.

```solidity
// BAD CODE - DO NOT USE
// Anyone can transfer funds out of any account!
function exploitableTransfer(address, _from, address _to, uint _amount) public {
    balances[_from] -= _amount;
    balances[_to] += _amount;
}
```

### Intuiting ownership with resources

Instead of using a central ledger system, Flow utilizes a few different concepts to provide better safety, security, and clarity for smart contract developers and users. Primarily, tokens are stored in each user's vault, which is a [resource] similar to the collection you created to store NFTs in the previous tutorial.

This approach simplifies access control because instead of a central contract having to check the sender of a function call, most function calls happen on resource objects stored in users' accounts, and each user natively has sole control over the resources stored in their accounts.

This approach also helps protect against potential bugs. In a Solidity contract with all the logic and state contained in a central contract, an exploit is likely to affect all users who are involved in the contract.

In Cadence, if there is a bug in the resource logic, an attacker would have to exploit the bug in each token holder's account individually, which is much more complicated and time-consuming than it is in a central ledger system.

## Constructing a vault

Our vault will be a simplified version of the one found in the [Flow Fungible Token standard]. We'll follow some of the same practices, including using [interfaces] to standardize the properties of our vault and make it easier for other contracts to interact with it.

Open the starter code for this tutorial in the Flow Playground: [play.flow.com/359cf1a1-63cc-4774-9c09-1b63ed83379b]

In `ExampleToken.cdc`, you'll see:

```cadence ExampleToken.cdc
access(all) contract ExampleToken {

    access(all) entitlement Withdraw

    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath


    init() {
        self.VaultStoragePath = /storage/CadenceFungibleTokenTutorialVault
        self.VaultPublicPath = /public/CadenceFungibleTokenTutorialReceiver
    }
}
```

Before you can add your vault, you'll need to implement the various pieces it will depend on.

### Supply and balance

The two most basic pieces of information for a fungible token are a method of tracking the balance of a given user and the total supply for the token. In Cadence, you'll usually want to use `UFix64` — a [fixed-point number].

Fixed-point numbers are essentially integers with a scale, represented by a decimal point. They make it much easier to work with money-like numbers as compared to endlessly handling conversions to and from the 10^18 or 10^9 representation of a value.

Implement a contract-level [fixed-point number] to track the `totalSupply` of the token, and `init` it:

```cadence
access(all) var totalSupply: UFix64
```

```cadence
self.totalSupply = 0.0;
```

### Creating interfaces

You'll also need a place to store the `balance` of any given user's vault. You **could** simply add a variable in the vault [resource] definition to do this, _and it would work_, but it's not the best option for composability.

Instead, let's use this opportunity to create some [interfaces].

In Cadence, interfaces are abstract types used to specify behavior in types that _implement_ the interface. Using them helps compatibility and composability by breaking larger constructions down into standardized parts that can be used by more than one contract for more than one use case. For example, the interface we'll create for `Receiver` is used by the vault, but it's also something you'd use for any other resource that needs to be able to receive tokens, such as a contract that pools a collection of tokens and splits them between several addresses.

In the following steps, you'll create three interfaces to handle the three functional areas of the vault:

- A `Balance` interface for the balance of tokens stored in the vault.
- A `Provider` interface that can provide tokens by withdrawing them from the vault.
- A `Receiver` interface that can safely deposit tokens from one vault into another.

1. Create a `Balance` interface, requiring a public `UFix64` called `balance`. It should be public:
   ```cadence
   access(all) resource interface Balance {
       access(all) var balance: UFix64
   }
   ```
   - This one is pretty simple. It just defines the type of variable that anything implementing it will need to have to keep track of a token balance.
1. Create the `Provider` `interface`. In it, define a `withdraw` function. It should have the `Withdraw` access [entitlement], accept an argument for `amount`, and return a `Vault` resource type. This should also be public.
1. To prevent an error, stub out the `Vault` resource as well:
   ```cadence
   access(all) resource interface Provider {
       access(Withdraw) fun withdraw(amount: UFix64): @Vault
   }

   access(all) resource Vault {}
   ```

   This [interface] will require resources implementing it to have a `withdraw` function, but it doesn't provide any limitations to how that function works. For example, it could be implemented such that the amount of tokens returned is double the withdrawn amount. While there might be a use case for that effect, it's not what you want for a normal token standard.

   You can allow for flexibility, such as allowing a `Provider` to select randomly from several vaults to determine the payer, while enforcing that the amount withdrawn is appropriate by adding a `post` condition to the function. [Function preconditions and postconditions] can be used to restrict the inputs and outputs of a function.

   In a postcondition, the special constant `result` is used to reference the `return` of the function. They're written following the rules of [statements] and can contain multiple conditions. Optionally, a `:` can be added after the last statement, containing an error message to be passed if the postcondition fails.

1. Add a `post` condition that returns a descriptive and nicely formatted error if the amount returned in the vault from the function doesn't match the `amount` passed into the function:

   ```cadence
   access(Withdraw) fun withdraw(amount: UFix64): @Vault {
       post {
           result.balance == amount:
               "ExampleToken.Provider.withdraw: Cannot withdraw tokens!"
               .concat("The balance of the withdrawn tokens (").concat(result.balance.toString())
               .concat(") is not equal to the amount requested to be withdrawn (")
               .concat(amount.toString()).concat(")")
      }
   }
   ```
   - This `post` condition will be added automatically to the `withdraw` function in a resource implementing `Provider`.

1. Implement an [interface] called `Receiver`, containing a function called `deposit` that accepts a `Vault`:
   ```cadence
   access(all) resource interface Receiver {
       access(all) fun deposit(from: @Vault)
   }
   ```

## Implementing the vault

You're finally ready to implement the vault:

1. Start by updating the stub for a `Vault` to implement `Balance`, `Provider`, and `Receiver`.
   ```cadence
   access(all) resource Vault: Balance, Provider, Receiver {
      // TODO
   }
   ```

   _You'll get errors:_

   ```text
   resource `ExampleToken.Vault` does not conform to resource interface `ExampleToken.Balance`. `ExampleToken.Vault` is missing definitions for members: Balance
   ```

   And similar errors for `Provider` and `Receiver`. Similar to inheriting from a virtual class in other languages, implementing the interfaces requires you to implement the properties from those interfaces in your resource.

1. Implement `balance` in the `vault`. You'll also need to initialize it.
1. Initialize it with the `balance` passed into the `init` for the resource itself:
   ```cadence
   access(all) var balance: UFix64

   init(balance: UFix64) {
       self.balance = balance
   }
   ```

   The pattern we're setting up here lets us create vaults and give them a `balance` in one go. Doing so is useful for several tasks — creating a temporary `Vault` to hold a balance during a transaction also creates most of the functionality you need to do complex tasks with that balance.

   For example, you might want to set up a conditional transaction that `deposit`s the balance in the vaults in different addresses based on whether or not a part of the transaction is successful.

1. Implement `withdraw` function for the `vault`. It should contain a precondition that validates that the user actually possesses equal to or greater than the number of tokens they are withdrawing.

   - While this functionality is probably something we'd want in every vault, we can't put the requirement in the [interface] because the interface doesn't have access to the `balance`.

   ```cadence
   access(Withdraw) fun withdraw(amount: UFix64): @Vault {
       pre {
           self.balance >= amount:
               "ExampleToken.Vault.withdraw: Cannot withdraw tokens! "
               .concat("The amount requested to be withdrawn (").concat(amount.toString())
               .concat(") is greater than the balance of the Vault (")
               .concat(self.balance.toString()).concat(").")
      }
      self.balance = self.balance - amount
      return <-create Vault(balance: amount)
   }
   ```

1. Implement the `deposit` function for the `vault`. Depositing should move the entire balance from the provided vault, and then `destroy` that `vault`. Remember, we're transferring tokens by creating a vault and funding it with the amount to transfer. It's not needed once the deposit has emptied it.

   ```cadence
   access(all) fun deposit(from: @Vault) {
       self.balance = self.balance + from.balance
       destroy from
   }
   ```

You **must** do something with the `Vault` resource after it's moved into the function. Again, you can safely `destroy` it, because it's now empty, and you don't need it anymore.

## Creating vaults

We'll also need a way to create empty vaults to onboard new users, or to create vaults for a variety of other uses.

Add a function to the contract to `create` an empty `Vault`:

```cadence
access(all) fun createEmptyVault(): @Vault {
    return <-create Vault(balance: 0.0)
}
```

We'll use this when we create a transaction to set up new users.

## Error handling

As before, you can anticipate some of the errors that other developers building transactions and scripts that interact with your contract might encounter. At the very least, it's likely that there will be many instances when an attempt is made to borrow a `Vault` that is not present or lacks a capability for the caller to borrow it.

Add a function to generate a helpful error if an attempt to borrow a `Vault` fails:

```cadence
access(all) fun vaultNotConfiguredError(address: Address): String {
    return "Could not borrow a collection reference to recipient's ExampleToken.Vault"
        .concat(" from the path ")
        .concat(ExampleToken.VaultPublicPath.toString())
        .concat(". Make sure account ")
        .concat(address.toString())
        .concat(" has set up its account ")
        .concat("with an ExampleToken Vault.")
}
```

## Minting

Next, you need a way to actually create, or mint, tokens. For this example, we'll define a `VaultMinter` resource that has the power to mint and airdrop tokens to any address that possesses a vault, or at least something with the `Receiver` [interface] for this token.

Only the owner of this resource will be able to mint tokens.

To do so, we use a [capability] with a reference to the resource or interface we want to require as the type: `Capability<&{Receiver}>`.

Define a public [resource] with a public function `mintTokens` that accepts an `amount` of tokens to mint, and a `recipient` that must possess the `Receiver` [capability]:

```cadence
access(all) resource VaultMinter {
    access(all) fun mintTokens(amount: UFix64, recipient: Capability<&{Receiver}>) {
        let recipientRef = recipient.borrow()
        ?? panic(ExampleToken.vaultNotConfiguredError(address: recipient.address))

        ExampleToken.totalSupply = ExampleToken.totalSupply + UFix64(amount)
        recipientRef.deposit(from: <-create Vault(balance: amount))
    }
}
```

:::tip

Don't be misled by the `access(all)` [entitlement] for this resource. This entitlement only allows public access to the `VaultMinter` **type**. It does **not** give access to the **instance** we'll create in a moment. That instance will be owned by the publisher of the contract and is the only one that can be created since there isn't a function to create more and `VaultMinter` does **not** have a public `init` function.

:::

## Final contract setup

The last task with the contract is to update the `init` function in your contract, which saves yourself a little bit of time by creating a `VaultMinter` in your account.

Update the contract `init` function to `create` and `save` an instance of `VaultMinter`:

```cadence
self
    .account
    .storage
    .save(<-create VaultMinter(),
        to: /storage/CadenceFungibleTokenTutorialMinter
    )
```

After doing all of this, your contract should be similar to:

```cadence
access(all) contract ExampleToken {

    access(all) entitlement Withdraw

    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath

    access(all) var totalSupply: UFix64

    access(all) resource interface Balance {
        access(all) var balance: UFix64
    }

    access(all) resource interface Provider {
        access(Withdraw) fun withdraw(amount: UFix64): @Vault {
            post {
                result.balance == amount:
                    "ExampleToken.Provider.withdraw: Cannot withdraw tokens!"
                    .concat("The balance of the withdrawn tokens (").concat(result.balance.toString())
                    .concat(") is not equal to the amount requested to be withdrawn (")
                    .concat(amount.toString()).concat(")")
            }
        }
    }

    access(all) resource interface Receiver {
        access(all) fun deposit(from: @Vault)
    }

    access(all) resource Vault: Balance, Provider, Receiver {
        access(all) var balance: UFix64

        init(balance: UFix64) {
            self.balance = balance
        }

        access(Withdraw) fun withdraw(amount: UFix64): @Vault {
            pre {
                self.balance >= amount:
                    "ExampleToken.Vault.withdraw: Cannot withdraw tokens! "
                    .concat("The amount requested to be withdrawn (").concat(amount.toString())
                    .concat(") is greater than the balance of the Vault (")
                    .concat(self.balance.toString()).concat(").")
            }
            self.balance = self.balance - amount
            return <-create Vault(balance: amount)
        }

        access(all) fun deposit(from: @Vault) {
            self.balance = self.balance + from.balance
            destroy from
        }
    }

    access(all) fun createEmptyVault(): @Vault {
        return <-create Vault(balance: 0.0)
    }

    access(all) fun vaultNotConfiguredError(address: Address): String {
        return "Could not borrow a collection reference to recipient's ExampleToken.Vault"
            .concat(" from the path ")
            .concat(ExampleToken.VaultPublicPath.toString())
            .concat(". Make sure account ")
            .concat(address.toString())
            .concat(" has set up its account ")
            .concat("with an ExampleToken Vault.")
    }

    access(all) resource VaultMinter {
        access(all) fun mintTokens(amount: UFix64, recipient: Capability<&{Receiver}>) {
            let recipientRef = recipient.borrow()
            ?? panic(ExampleToken.vaultNotConfiguredError(address: recipient.address))

            ExampleToken.totalSupply = ExampleToken.totalSupply + UFix64(amount)
            recipientRef.deposit(from: <-create Vault(balance: amount))
        }
    }

    init() {
        self.VaultStoragePath = /storage/CadenceFungibleTokenTutorialVault
        self.VaultPublicPath = /public/CadenceFungibleTokenTutorialReceiver

        self
            .account
            .storage
            .save(<-create VaultMinter(),
                to: /storage/CadenceFungibleTokenTutorialMinter
            )

        self.totalSupply = 0.0;
    }
}
```

Deploy the `ExampleToken` contract with account `0x06`.

## Setting up an account transaction

We'll now need to create several transactions and scripts to manage interactions with the vault. The first step is to set up a user's account. It needs to:

- Create an empty vault.
- Save that vault in the caller's storage.
- Issue a capability for the vault.
- Publish that capability.

You've already learned how to do everything you need for this, so you should be able to implement it on your own.

Implement the `Set Up Account` transaction. You should end up with something similar to:

```cadence
import ExampleToken from 0x06

transaction {
    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        // You may wish to check if a vault already exists here

        let vaultA <- ExampleToken.createEmptyVault()

        signer.storage.save(<-vaultA, to: ExampleToken.VaultStoragePath)

        let receiverCap = signer.capabilities.storage.issue<&ExampleToken.Vault>(
            ExampleToken.VaultStoragePath
        )

        signer.capabilities.publish(receiverCap, at: ExampleToken.VaultPublicPath)
    }
}
```

## Minting tokens

The next transaction is another one that you should be able to implement on your own. Give it a try, and check the solution if you need to. Your transaction should:

- Accept an `Address` for the `recipient` and an `amount`.
- Store transaction-level references to the `VaultMinter` and `Receiver`.
- Borrow a reference to the `VaultMinter` in the caller's storage.
- Get the `recipient`'s `Receiver` capability.
- Use the above to call the `mintTokens` function in the minter.

Implement the `Mint Tokens` transaction. You should end up with something similar to:

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
        // Mint 30 tokens and deposit them into the recipient's Vault
        self.mintingRef.mintTokens(amount: 30.0, recipient: self.receiver)

        log("30 tokens minted and deposited to account "
            .concat(self.receiver.address.toString()))
    }
}
```

Test out your minting function by attempting to mint tokens to accounts that do and do not have vaults.

## Checking account balances

You can mint tokens now. Probably. But it's hard to tell if you have a bug without a way to check an account's balance. You can do this with a script, using techniques you've already learned.

Write a script to check the balance of an address. It should accept an argument for an `address`. In this script, `get` and `borrow` a reference to that address's `Vault` from the `VaultPublicPath`, and return a nicely formatted string containing the `balance`.

You should end up with something similar to:

```cadence
import ExampleToken from 0x06

access(all)
fun main(address: Address): String {
    let account = getAccount(address)

    let accountReceiverRef = account.capabilities.get<&{ExampleToken.Balance}>(ExampleToken.VaultPublicPath)
                            .borrow()
            ?? panic(ExampleToken.vaultNotConfiguredError(address: address))

    return("Balance for "
        .concat(address.toString())
        .concat(": ").concat(accountReceiverRef.balance.toString())
        )
}
```

## Transferring tokens

Transferring tokens from one account to another takes a little more coordination and a more complex transaction. When an account wants to send tokens to a different account, the sending account calls their own withdraw function first, which subtracts tokens from their resource's balance and temporarily creates a new resource object that holds this balance.

1. Initialize a transaction-level variable to hold a temporary vault. Borrow a reference for the sender's vault with the `Withdraw` entitlement and send it to the temporary vault:

   ```cadence
   import ExampleToken from 0x06

   transaction(recipient: Address, amount: UFix64) {
       var temporaryVault: @ExampleToken.Vault

     prepare(signer: auth(BorrowValue) &Account) {
          let vaultRef = signer.storage.borrow<auth(ExampleToken.Withdraw) &ExampleToken.Vault>(
                  from: ExampleToken.VaultStoragePath)
               ?? panic(ExampleToken.vaultNotConfiguredError(address: signer.address))

          self.temporaryVault <- vaultRef.withdraw(amount: amount)
      }
   }
   ```

   The sending account then gets a reference to the recipient's published capability and calls the recipient account's deposit function, which literally moves the resource instance to the other account, adds the temporary vault's balance to their balance, and then destroys the used resource.

1. Use the `execute` phase to `deposit` the tokens in the `temporaryVault` into the recipient's vault:

   ```cadence
   execute{
       let receiverAccount = getAccount(recipient)

       let receiverRef = receiverAccount
           .capabilities
           .borrow<&ExampleToken.Vault>(ExampleToken.VaultPublicPath)
           ?? panic(ExampleToken.vaultNotConfiguredError(address: recipient))

       receiverRef.deposit(from: <-self.temporaryVault)

       log("Withdraw/Deposit succeeded!")
   }
   ```

The resource is destroyed by the `deposit` function. It needs to be destroyed because Cadence enforces strict rules around resource interactions. A resource can never be left hanging in a piece of code. It either needs to be explicitly destroyed or stored in an account's storage.

This rule ensures that resources, which often represent real value, do not get lost because of a coding error.

You'll notice that the arithmetic operations aren't explicitly protected against overflow or underflow:

```cadence
self.balance = self.balance - amount
```

Cadence has built-in overflow and underflow protection, so it is not a risk. We are also using unsigned numbers in this example, so as mentioned earlier, the vault`s balance cannot go below 0.

Additionally, the requirement that an account contains a copy of the token's resource type in its storage ensures that funds cannot be lost by being sent to the wrong address.

If an address doesn't have the correct resource type imported, the transaction will revert, ensuring that transactions sent to the wrong address are not lost.

:::danger

Every Flow account is initialized with a default Flow Token Vault in order to pay for storage fees and transaction [fees]. If an address is in use, it will be able to accept Flow tokens, without a user or developer needing to take further action. If that account becomes lost, any tokens inside will be lost as well.

:::

## Reviewing fungible tokens

In this tutorial, you learned how to create a simplified version of fungible tokens on Flow. You build a vault [resource] to safely store tokens inside the owner's storage, and use [interfaces] to define and enforce the properties a vault should have. By using [interfaces], your definition is flexible and composable. Other developers can use all or parts of these definitions to build new apps and contracts that are compatible with yours.

You also practiced writing transactions on your own, and learned some new techniques, such as writing error messages more easily, using paths stored in the contract, and separating different parts of the transaction into their appropriate sections — `prepare` and `execute`.

Now that you have completed the tutorial, you should be able to:

- Compare and contrast how tokens are stored in Flow Cadence compared to Ethereum.
- Utilize the `UFix64` type to allow decimals without converting back and forth with 10^18.
- Implement a vault [resource] to manage the functionality needed for fungible tokens.
- Use [interfaces] to enforce the presence of specified functions and fields.
- Write transactions to transfer tokens safely from one account to another.
- Develop scripts to read account balances.
- Use preconditions and postconditions to perform checks before or after a function call completes.

If you're ready to try your hand at implementing a production-quality token, head over to the [Fungible Token Developer Guide].

In the next tutorial, you'll combine the techniques and patterns you've learned for the classic challenge — building an NFT marketplace!

## Reference solution

:::warning

You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.

:::

- [Reference Solution]

<!-- Reference-style links, do not render on page -->

[resource]: ../language/resources.mdx
[interface]: ../language/interfaces.mdx
[interfaces]: ../language/interfaces.mdx
[native network token (FLOW)]: https://github.com/onflow/flow-core-contracts/blob/master/contracts/FlowToken.cdc
[Flow Fungible Token standard]: https://github.com/onflow/flow-ft
[Fungible Token Developer Guide]: https://developers.flow.com/build/guides/fungible-token
[reentrancy]: https://docs.soliditylang.org/en/latest/security-considerations.html#reentrancy
[resource]: ../language/resources.mdx
[resources]: ../language/resources.mdx
[fixed-point number]: ../language/values-and-types.mdx#fixed-point-numbers
[entitlement]: ../language/access-control.md
[Function preconditions and postconditions]: ../language/functions.mdx#function-preconditions-and-postconditions
[statements]: ../language/syntax.md#semicolons
[capability]: ../language/capabilities.md
[fees]: https://developers.flow.com/build/basics/fees.md#fees
[Reference Solution]: https://play.flow.com/b0f19641-0831-4192-ae25-ae745b1cab55
[Fungible Tokens section below]: #fungible-tokens-on-flow
[play.flow.com/359cf1a1-63cc-4774-9c09-1b63ed83379b]: https://play.flow.com/359cf1a1-63cc-4774-9c09-1b63ed83379b
