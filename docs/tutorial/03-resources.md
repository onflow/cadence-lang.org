---
archived: false
draft: false
title: Resources and the Move (<-) Operator
description: An introduction to resources, capabilities, and account storage in Cadence
date: 2024-12-04
meta:
  keywords:
    - tutorial
    - Flow
    - Cadence
    - Resources
    - Capabilities
tags:
  - reference
  - cadence
  - tutorial
socialImageTitle: Cadence Resources
socialImageDescription: Resource smart contract image.
---

This tutorial will build on your understanding of accounts and how to interact with them by introducing [resources].  Resources are a special type found in Cadence that are used for any virtual items, properties, or any other sort of data that are **owned** by an account.  They can **only exist in one place at a time**, which means they can be moved or borrowed, but they **cannot be copied**.

Working with resources requires you to take a few more steps to complete some tasks, but this level of explicit control makes it nearly impossible to accidentally duplicate, break, or burn an asset.

## Objectives

After completing this tutorial, you'll be able to:

* Instantiate a `resource` in a smart contract with the `create` keyword
* Save, move, and load resources using the [Account Storage API] and the [move operator] (`<-`)
* Use [`borrow`] to access and use a function in a resource
* Use the `prepare` phase of a transaction to load resources from account storage
* Set and use variables in both the `prepare` and `execute` phase
* Use the [nil-coalescing operator (`??`)] to `panic` if a resource is not found

## Resources

[Resources] are one of the most important and unique features in Cadence.  They're a composite type, like a struct or a class in other languages, but with some special rules designed to avoid many of the traditional dangers in smart contract development.  The short version is that resources can only exist in one location at a time - they cannot be copied, duplicated, or have multiple references.

Here is an example definition of a resource:

```cadence
access(all) resource Money {
    access(all) let balance: Int

    init() {
        self.balance = 0
    }
}
```

See, it looks just like a regular `struct` definition! The difference is in the behavior.

Resources are useful when you want to model **direct ownership** of an asset or an object. By **direct ownership**, we mean the ability to own an **actual object** in **your storage** that represents your asset, instead of just a password or certificate that allows you to access it somewhere else.

Traditional structs or classes from other conventional programming languages
are not an ideal way to represent direct ownership because they can be **copied**. This means a coding error can easily result in creating multiple copies of the same asset, which breaks the scarcity requirements needed for these assets to have real value.

We have to consider loss and theft at the scale of a house, a car, a bank account, or a horse.  It's worth a little bit of extra code to avoid accidentally duplicating ownership of one of these properties!

Resources solve this problem by making creation, destruction, and movement of assets explicit.

## Implementing a Contract with Resources

:::info[Action]

Open the starter code for this tutorial in the Flow Playground:

<a
  href="https://play.flow.com/b999f656-5c3e-49fa-96f2-5b0a4032f4f1"
  target="_blank"
>
  https://play.flow.com/b999f656-5c3e-49fa-96f2-5b0a4032f4f1
</a>

`HelloWorldResource.cdc` contains the following code:

:::


```cadence HelloWorldResource.cdc
access(all) contract HelloResource {
  // TODO
}
```

### Defining a Resource

Similar to other languages, Cadence can declare type definitions within deployed contracts. A type definition is simply a description of how a particular set of data is organized. It **is not** a copy or instance of that data on its own.

Any account can import these definitions to interact with objects of those types.

The key difference between a `resource` and a `struct` or `class` is the access scope for resources:

- Each instance of a resource can only exist in exactly one location and cannot be copied.
  - Here, location refers to account storage, a temporary variable in a function, a storage field in a contract, etc.
- Resources must be explicitly moved from one location to another when accessed.
- Resources also cannot go out of scope at the end of function execution. They must be explicitly stored somewhere or explicitly destroyed.
- A resource can only be created in the scope that it is defined in. 
  - This prevents anyone from being able to create arbitrary amounts of resource objects that others have defined.

These characteristics make it impossible to accidentally lose a resource from a coding mistake.

:::info[Action]

Add a `resource` called `HelloAsset` that contains a function to return a string containing "Hello Resources!":

::

```cadence HelloResource.cdc
access(all) contract HelloResource {
    access(all) resource HelloAsset {
        // A transaction can call this function to get the "Hello Resources!"
        // message from the resource.
        access(all) view fun hello(): String {
            return "Hello Resources!"
        }
    }
}
```

A few notes on this function:
* `access(all)` makes the function publicly accessible
* `view` indicates that the function does not modify state
* The function return type is a `String`
* The function is **not** present on the contract itself and cannot be called by interacting with the contract

:::warning

If you're used to Solidity, you'll want to take note that the `view` keyword in Cadence is used in the same cases as both `view` and `pure` in Solidity.

:::

### Creating a Resource

Next, you'll create a resource with the `create` keyword and the [move operator] (`<-`).

You use the `create` keyword used to initialize a resource. Resources can only be created by the contract that defines them and **must** be created before they can be used.

The move operator `<-` is used to move a resource - you cannot use the assignment operator `=`. When you initialize them or assign then to a new variable, you use the move operator `<-` to **literally move** the resource from one location to another. The old variable or location that was holding it will no longer be valid after the move.

If you create a resource called `first_resource`:

```cadence
// Note the `@` symbol to specify that it is a resource
var first_resource: @AnyResource <- create AnyResource()
```

Then move it:

```cadence
var second_resource <- first_resource
```

The name `first_resource` is **no longer valid or usable**:

```cadence
// Bad code, will generate an error
var third_resource <- first_resource
```

:::info[Action]

Add a function called `createHelloAsset` that creates and returns a `HelloAsset` resource.

:::

```cadence HelloWorldResource.cdc
access(all) fun createHelloAsset(): @HelloAsset {
    return <-create HelloAsset()
}
```

Unlike the `hello()` function, this function **does** exist on the contract and can be called directly.  Doing so creates an instance of the `HelloAsset` resource, **moves** it through the `return` of the function to the location calling the function - the same as you'd expect for other languages.

Remember, when resources are referenced, the `@` symbol is placed at the beginning.  In the function above, the return type is a resource of the `HelloAsset` type.

:::info[Action]

Deploy this code to account `0x06` by using the `Deploy` button.

:::

## Create Hello Transaction

Now, we're going to create a transaction that calls the `createHelloAsset()` function and saves a `HelloAsset` resource to the account's storage.

:::info[Action]

Open the transaction named `Create Hello`.

:::


`Create Hello` should contain the following code:

```cadence create_hello.cdc
import HelloWorldResource from 0x06

transaction {
  // TODO
}
```

We've already imported the `HelloWorldResource` contract for you and stubbed out a `transaction`.  Unlike the transaction in Hello World, you will need to modify the user's account, which means you will need to use the `prepare` phase to access and modify the account that is going to get an instance of the resource.

### Prepare Phase

:::info[Action]

Create a `prepare` phase with the `SaveValue` authorization [entitlement] to the user's account, `create` a new instance of the `HelloAsset`, and save the new resource in the user's account.

First, inside the `transaction`, stub out the `prepare` phase with the authorization [entitlement]:

:::

```cadence
prepare(acct: auth(SaveValue) &Account) {
   // TODO
}
```

:::info[Action]

Next, use the `createHelloAsset` function in `HelloWorldResource` to `create` an instance of the resource and _move_ it into a constant:

:::

```cadence
let newHello <- HelloWorldResource.createHelloAsset()
```

### Storage Paths

In Cadence Accounts, objects are stored in [paths]. Paths represent a file system for your account, where an object can be stored at any user-defined path. Often, contracts will specify for the user where objects from that contract should be stored. This enables any code to know how to access these objects in a standard way.

Paths start with the character `/`, followed by the domain, the path separator `/`, and finally the identifier. The identifier must start with a letter and can only be followed by letters, numbers, or the underscore `_`. For example, the path `/storage/test` has the domain `storage` and the identifier `test`.

There are two valid domains: `storage` and `public`.

Paths in the storage domain have type `StoragePath`, and paths in the public domain have the type `PublicPath`. Both `StoragePath` and `PublicPath` are subtypes of `Path`.

Paths are not strings and do not have quotes around them.

:::info[Action]

Use the account reference with the `SaveValue` authorization [entitlement] to move the new resource into storage located in `/storage/HelloAssetTutorial`.

:::

```cadence
acct.storage.save(<-newHello, to: /storage/HelloAssetTutorial)
```

The first parameter in `save` is the object that is being stored, and the `to` parameter is the path that the object is being stored at. The path must be a storage path, so only the domain `/storage/` is allowed in the `to` parameter.

If there is already an object stored under the given path, the program aborts.

Remember, the Cadence type system ensures that a resource can never be accidentally lost. When moving a resource to a field, into an array, into a dictionary, or into storage, there is the possibility that the location already contains a resource.

Cadence forces the developer to explicitly handle the case of an existing resource so that it is not accidentally lost through an overwrite.

It is also very important when choosing the name of your paths to pick an identifier that is very specific and unique to your project.

Currently, account storage paths are global, so there is a chance that projects could use the same storage paths, **which could cause path conflicts**! This could be a headache for you, so choose unique path names to avoid this problem.

### Execute Phase

:::info[Action]

Use the `execute` phase to `log` a message that the resource was successfully saved:

:::

```cadence
execute {
    log("Saved Hello Resource to account.")
}
```

You should have something similar to:

```cadence
import HelloResource from 0x06

transaction {
        prepare(acct: auth(SaveValue) &Account) {
        let newHello <- HelloResource.createHelloAsset()
        acct.storage.save(<-newHello, to: /storage/HelloAssetTutorial)
    }

	execute {
        log("Saved Hello Resource to account.")
	}
}
```

This is our first transaction using the `prepare` phase!

The `prepare` phase is the only place that has access to the signing account, via [account references (`&Account`)].

Account references have access to many different methods that are used to interact with an account, such as to `save` a resource to the account's storage.

By not allowing the execute phase to access account storage and using entitlements, we can statically verify which assets and areas/paths of the signers' account a given transaction can modify.

Browser wallets and applications that submit transactions for users can use this to show what a transaction could alter, giving users information about transactions that wallets will be executing for them, and confidence that they aren't getting fed a malicious or dangerous transaction from an app or wallet.

:::info[Action]

Select account `0x06` as the only signer. Click the `Send` button to submit
the transaction.

:::

You'll see in the log:

```text
"Saved Hello Resource to account."
```

:::info[Action]

`Send` the transaction again from account `0x06`

:::

You'll now get an error, because there's already a resource in `/storage/HelloAssetTutorial`:

```text
execution error code 1: [Error Code: 1101] error caused by: 1 error occurred:
	* transaction execute failed: [Error Code: 1101] cadence runtime error: Execution failed:
error: failed to save object: path /storage/HelloAssetTutorial in account 0x0000000000000009 already stores an object
  --> 805f4e247a920635abf91969b95a63964dcba086bc364aedc552087334024656:19:8
   |
19 |         acct.storage.save(<-newHello, to: /storage/HelloAssetTutorial)
   |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

:::info[Action]

Try removing the line of code that saves `newHello` to storage.

You'll get an error for `newHello` that says `loss of resource`. This means that you are not handling the resource properly. Remember that if you ever see this error in any of your programs, it means there is a resource somewhere that is not being explicitly stored or destroyed.

**Add the line back before you forget!**

:::

### Reviewing Storage

Now that you have executed the transaction, account `0x06` will have the newly created `HelloWorld.HelloAsset` resource stored in its storage. You can verify this by clicking on account `0x06` on the bottom left. This will open a view of the different contracts and objects in the account.

You'll see the resource you created in Account Storage:

```
{
    "value": [
        {
            "key": {
                "value": "value",
                "type": "String"
            },
            "value": {
                "value": {
                    "id": "A.0000000000000006.HelloResource.HelloAsset",
                    "fields": [
                        {
                            "value": {
                                "value": "269380348805120",
                                "type": "UInt64"
                            },
                            "name": "uuid"
                        }
                    ]
                },
                "type": "Resource"
            }
        },
        {
            "key": {
                "value": "type",
                "type": "String"
            },
            "value": {
                "value": "A.0000000000000006.HelloResource.HelloAsset",
                "type": "String"
            }
        },
        {
            "key": {
                "value": "path",
                "type": "String"
            },
            "value": {
                "value": {
                    "domain": "storage",
                    "identifier": "HelloAssetTutorial"
                },
                "type": "Path"
            }
        }
    ],
    "type": "Dictionary"
}
```

You'll also see `FlowToken` objects, and the `HelloResource` Contract.

:::info[Action]

Run the transaction from account `0x07` and compare the differences between the accounts.

:::

### Checking for Existing Storage

In real applications, you need to check the location path you are storing in to make sure both cases are handled properly.

:::info[Action]

First, update the authorization [entitlement] in the prepare phase to include `BorrowValue`:

:::

```cadence
prepare(acct: auth(BorrowValue, SaveValue) &Account) {
    // Existing code...
}
```

:::info[Action]

Next, add a `transaction`-level variable to store a result `String`:

:::

Similar to a class-level variable in other languages, these go at the top, inside the `transaction` scope, but not inside anything else. They are accessible in both the `prepare` and `execute` statements of a transaction.

```cadence
import HelloResource from 0x06

transaction {
    var result: String
    // Other code...
}
```

You'll get an error: `missing initialization of field `result` in type `Transaction`. not initialized`

In transactions, variables at the `transaction` level must be initialized in the `prepare` phase.

:::info[Action]

Initialize the `result` message and create a constant for the storage path.

:::

```cadence
self.result = "Saved Hello Resource to account."
let storagePath = /storage/HelloAssetTutorial
```

:::warning

In Cadence, storage paths are a type.  They are **not** `Strings` and are not enclosed by quotes.

:::

One way to check whether or not a storage path has an object in it is to use the built-in [`storage.check`] function with the type and path.  If the result is `true`, then there is an object in account storage that matches the type requested.  If it's `false`, there is not.

```warning

A response of `false` does **not** mean the location is empty.  If you ask for an apple and the location contains an orange, this function will return `false`.

This is not likely to occur because projects are encouraged to create storage and public paths that are very unique, but is theoretically possible if projects don't follow this best practice or if there is a malicious app that tries to store things in other projects' paths.

```

Depending on the needs of your app, you'll use this pattern to decide what to do in each case.  For this example, we'll simply use it to change the log message if the storage is in use or create and save the `HelloAsset` if it is not.

:::info[Action]

Refactor your prepare statement to check and see if the storage path is in use.  If it is, update the `result` message.  Otherwise, create and save a `HelloAsset`:

:::

```cadence
if !acct.storage.check<&HelloWorldResource.HelloAsset>(from: storagePath) {
    self.result = "Unable to save, resource already present."
} else {
    let newHello <- HelloWorldResource.createHelloAsset()
    acct.storage.save(<-newHello, to: storagePath)
}
```

When you [`check`] a resource, you must put the type of the resource to be borrowed inside the `<>` after the call to `borrow`, before the parentheses.  The `from` parameter is the storage path to the object you are borrowing.

:::info[Action]

Finally, update the `log` in execute to use `self.result` instead of the hardcoded string:

:::

```cadence
execute {
    log(self.result)
}
```

:::info[Action]

`Send` the transaction again, both with accounts that have and have not yet created and stored an instance of `HelloAsset`.

:::

Now you'll see an appropriate log whether or not a new resource was created and saved.


## Load Hello Transaction

Now we're going to use a transaction to call the `hello()` method from the `HelloAsset` resource.

:::info[Action]

Open the transaction named `Load Hello`.

:::

It's empty!

:::info[Action]

On your own, stub out a transaction that imports `HelloWorldResource` and passes in an account [reference] with the `BorrowValue` authorization entitlement.

:::

You should end up with something like this:

```cadence load_hello.cdc
import HelloWorldResource from 0x06

transaction {

    prepare(acct: auth(BorrowValue) &Account) {
        // TODO
    }
}
```

You just learned how to [`borrow`] a [reference] to a resource.  You could use an `if` statement to handle the possibility that the resource isn't there, but if you want to simply terminate execution, a common practice is to combine a `panic` statement with the [nil-coalescing operator (`??`)].

This operator executes the statement on the left side.  If that is `nil`, the right side is evaluated and returned.  In this case, the return is irrelevant, because we're going to cause a `panic` and terminate execution.

:::info[Action]

Create a variable with a [reference] to the `HelloAsset` resource stored in the user's account.  Panic if this resource is not found.

:::

```cadence
let helloAsset = acct.storage.borrow<&HelloWorldResource.HelloAsset>(from: /storage/HelloAssetTutorial)
    ?? panic("The signer does not have the HelloAsset resource stored at /storage/HelloAssetTutorial. Run the `Create Hello` Transaction to store the resource")
```

:::info[Action]

Finally, `log` the return from a call to the `hello()` function.

:::

:::warning

Borrowing a [reference] does **not** allow you to move or destroy a resource, but it **does allow** you to mutate data inside that resource via one of the resource's functions.

:::

Your transaction should be similar to:

```cadence
import HelloWorldResource from 0x06

transaction {
    prepare(acct: auth(BorrowValue, LoadValue, SaveValue) &Account) {
        let helloAsset = acct.storage.borrow<&HelloWorldResource.HelloAsset>(from: /storage/HelloAssetTutorial)
            ?? panic("The signer does not have the HelloAsset resource stored at /storage/HelloAssetTutorial. Run the `Create Hello` Transaction again to store the resource")

        log(helloAsset.hello())
    }
}
```

In Cadence, we have the resources to leave very detailed error messages. Check out the error messages in the [Non-Fungible Token Contract] and [Generic NFT Transfer transaction] in the Flow NFT GitHub repo for examples of production error messages.

:::info[Action]

Test your transaction with several accounts to evaluate all possible cases.

:::

## Reviewing the Resource Contract

In this tutorial you learned how to `create` [resources] in Cadence. You implemented a smart contract that is accessible in all scopes.  The smart contract has a resource declared that implemented a function called `hello()`, that returns the string `"Hello, World!"`.  It also declares a function that can create a resource.

Next, you implemented a transaction to create the resource and save it in the account calling it.

Finally, you used a transaction to [borrow] a [reference] to the `HelloAsset` resource from account storage and call the `hello` method

Now that you have completed the tutorial, you can:

* Instantiate a `resource` in a smart contract with the `create` keyword
* Save, move, and load resources using the [Account Storage API] and the [move operator] (`<-`)
* Use [`borrow`] to access and use a function in a resource
* Use the `prepare` phase of a transaction to load resources from account storage
* Set and use variables in both the `prepare` and `execute` phase
* Use the [nil-coalescing operator (`??`)] to `panic` if a resource is not found

<!-- Relative links.  Will not render on the page -->

[resources]: ../language/resources.mdx
[Resources]: ../language/resources.mdx
[move operator]: ../language/operators.md#move-operator--
[Account Storage API]: ../language/accounts/storage.mdx
[`storage.check`]: ../language/accounts/storage.mdx#accountstorage
[`borrow`]: ../language/accounts/storage.mdx#accessing-objects
[borrow]: ../language/accounts/storage.mdx#accessing-objects
[entitlement]: ../language/access-control#entitlements
[account references (`&Account`)]: ../language/accounts/index.mdx
[paths]: ../language/accounts/paths.mdx
[reference]: ../language/references.mdx
[nil-coalescing operator (`??`)]: ../language/operators.md#nil-coalescing-operator-
[Non-Fungible Token Contract]: https://github.com/onflow/flow-nft/blob/master/contracts/NonFungibleToken.cdc#L115-L121)
[Generic NFT Transfer transaction]: https://github.com/onflow/flow-nft/blob/master/transactions/generic_transfer_with_address_and_type.cdc#L46-L50
