---
archived: false
draft: false
title: 4. Capability Tutorial
description: An introduction to capabilities and how they interact with resources in Cadence
date: 2024-02-26
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
socialImageDescription: Capability smart contract image.
---
## Overview
<Callout type="success">
  Open the starter code for this tutorial in the Flow Playground. It is the same code that was in the previous tutorial: <br />
  <a
    href="https://play.onflow.org/a7f45bcd-8fda-45f6-b443-4b77302a1687"
    target="_blank"
  >
    https://play.onflow.org/a7f45bcd-8fda-45f6-b443-4b77302a1687
  </a>
  The tutorial will ask you to take various actions to interact with this code.
</Callout>

<Callout type="info">
  The playground code that is linked uses Cadence 0.42, but the examples
  use Cadence 1.0 to show how each contract, transaction and script
  is implemented in Cadence 1.0. 
  You can access a Cadence 1.0-compatible playground by going to https://v1.play.flow.com/.
  The project link will still work with the current version of the playground,
  but when the playground is updated to Cadence 1.0, the link will be replaced with a 1.0-compatible version.
</Callout>

<Callout type="info">
  Instructions that require you to take action are always included in a callout
  box like this one. These highlighted actions are all that you need to do to
  get your code running, but reading the rest is necessary to understand the
  language's design.
</Callout>

This tutorial builds on the [previous `Resource` tutorial](./03-resources.md).
Before beginning this tutorial, you should have an idea of
how accounts, transactions, resources, and signers work with basic field types.
This tutorial will build on your understanding of accounts and resources.

You'll learn how to interact with resources using [capabilities](../language/capabilities.md)
and [entitlements](../language/access-control#entitlements).

In Cadence, resources are a composite type like a struct or a class, but with some special rules:
- Each instance of a resource can only exist in exactly one location and cannot be copied.
- Resources must be explicitly moved from one location to another when accessed.
- Resources also cannot go out of scope at the end of function execution, they must be explicitly stored somewhere or destroyed.

### Use-Cases for Capabilities and Entitlements

Let's look at why you would want to use capabilities and entitlements
to expand access to resources in a real-world context.

A real user's account and stored objects will contain functions
and fields that need varying levels of access scope and privacy.
For example, if you're working on an app that allows users to exchange tokens.
While you definitely want to make a feature like withdrawing tokens
from an account only accessible by the owner of the tokens,
your app should allow anybody to deposit tokens.

Capabilities and entitlements are what allows for this detailed control of access to owned assets.
They allow a user to indicate which of the functionality of their account and owned objects
should be accessible to themselves, their trusted friends, and the public.

For example, a user might want to allow a friend of theirs to use some of their money to spend,
in this case, they could create an entitled capability that gives the friend access
to only this part of their account, instead of having to hand over full control.

Another example is when a user authenticates a trading app for the first time,
they could ask the user for a capability object that allows
the app to access the trading functionality of a user's account so that
the app doesn't need to ask the user for a signature every time.

In this tutorial, you will:
1. Interact with the resource we created using transactions
2. Create capabilities to extend the resource access scope
3. Execute a script that interacts with the resource through the capability

## Accessing Resources with Capabilities

---
Before following this tutorial, you should have the `HelloWorld` contract deployed in account `0x01`,
just like in the [previous `Resource` contract tutorial](./03-resources.md).

<Callout type="info">

Open the Account `0x01` tab with file named `HelloWorldResource.cdc`. <br />
`HelloWorldResource.cdc` should contain the following code:

</Callout>

```cadence HelloWorldResource-2.cdc
access(all)
contract HelloWorld {

    // Declare a resource that only includes one function.
    access(all)
    resource HelloAsset {

        // A transaction can call this function to get the "Hello, World!"
        // message from the resource.
        access(all)
        fun hello(): String {
            return "Hello, World!"
        }
    }

    // We're going to use the built-in create function to create a new instance
    // of the HelloAsset resource
    access(all)
    fun createHelloAsset(): @HelloAsset {
        return <-create HelloAsset()
    }
}
```

<Callout type="info">

Deploy this code to account `0x01` using the `Deploy` button.

</Callout>

<Callout type="info">

Click on the `Create Hello` transaction and send it with `0x01` as the signer.

</Callout>

The contract and transaction above creates and stores the resource we'll be using in this tutorial.
For a more detailed breakdown of the contract and transactions,
have a look at the [previous tutorial](./03-resources.md).

### Creating Capabilities and References to Stored Resources

---
You need explicit permission from the owner of an account to access its storage.
Capabilities allow an account owner to grant access to specific fields and functions
on objects stored in their account. (Explained more below)

In the upcoming transaction, you issue a new capability using the `issue` function.
This creates a link to your `HelloAsset` resource object.
Then you publish that link to your account's public space, so others can access it.

Next, anyone can use that link to borrow a [reference](../language/references.mdx)
to the underlying object and call the `hello()` function.
A detailed explanation of what is happening in this transaction
is below the transaction code so, if you feel lost, keep reading!

<Callout type="info">

Open the transaction named `Create Link`.

<br />

`Create Link` should contain the following code:

</Callout>

```cadence create_link.cdc
import HelloWorld from 0x01

// This transaction creates a new capability
// for the HelloAsset resource in storage
// and adds it to the account's public area.
//
// Other accounts and scripts can use this capability
// to create a reference to the private object to be able to
// access its fields and call its methods.

transaction {
  // We use `auth(IssueStorageCapabilityController, PublishCapability) &Account` to 
  // ensure that the only thing that this transaction is allowed to do with the signer's account
  // is issue and publish capabilities
  prepare(account: auth(IssueStorageCapabilityController, PublishCapability) &Account) {

    // Create a capability by linking the capability to
    // a `target` object in account storage.
    // The capability allows access to the object through an
    // interface defined by the owner.
    // This does not check if the link is valid or if the target exists.
    // It just creates the capability.
    let capability = account.capabilities.storage.issue<&HelloWorld.HelloAsset>(/storage/HelloAssetTutorial)

    // Publish the capability so it is accessible to all
    account.capabilities.publish(capability, at: /public/HelloAssetTutorial)

    // Use the capability's borrow method to create a new reference
    // to the object that the capability links to
    // We use optional chaining "??" to get the value because
    // result of the borrow could fail, so it is an optional.
    // If the optional is nil,
    // the panic will happen with a descriptive error message
    let helloReference = capability.borrow()
      ?? panic("Could not borrow a reference to the HelloAsset capability. This could be
                because the resource is not stored or the capability wasn't published")

    // Call the hello function using the reference
    // to the HelloAsset resource.
    //
    log(helloReference.hello())
  }
}
```

<Callout type="info">

Ensure account `0x01` is still selected as a transaction signer. <br />
Click the `Send` button to send the transaction.

</Callout>

In this transaction, we use the prepare phase to:
1. Create a capability with the `account.capabilities.storage.issue` method to the stored object `HelloWorld.HelloAsset` from the account path `/storage/HelloAssetTutorial`
2. Publish the capability to the account path `/public/HelloAssetTutorial`
3. Use the `borrow` method to create a reference to the object we linked to called `helloReference`
4. Call the `hello()` function using the reference we created, `helloReference`

You should see `"Hello, World"` show up in the console again.
You might be confused that we were able to call a method on the `HelloAsset` object
without actually having loaded it from storage to get control of it!
It is stored in the `/storage/` domain of the account, which should be private.

This is because we created a [**capability**](../language/capabilities.md) for the `HelloAsset` object.
Capabilities are kind of like pointers in other languages, but with much more fine-grained control.

### Capability Based Access Control

[Capabilities](../language/capabilities.md) allow the owners of objects
to specify what functionality of their private objects is available to others.
Think of it kind of like an account's API, if you're familiar with the concept.

The account owner has private objects stored in their storage, like their collectibles or their money,
but they might still want others to be able to see what collectibles they have in their account,
or they want to allow anyone to access the deposit functionality for a certain asset.
Since these objects are stored in private storage by default, the owner has to do something
to open up access to these while still retaining full control.
We create capabilities to accomplish this.

In our example, the owner of `HelloAsset` might still want to let other people call the `hello` method.
This is what capabilities are for. They represent a link to an object
in an account's storage that has the type specified when the link is created.

It is important to remember that someone else who has this capability
cannot move or destroy the object that the capability is linked to!
They can only access fields that the owner has explicitly declared in the type specification
and authorization-level of the `issue` method (described below).

Capabilities do not have any meaningful functionality on their own, but every capability has a `borrow` method,
which creates a reference to the object that the capability is linked to.
This reference is used to read fields or call methods on the object they reference
as if the owner of the reference had the actual object.

Note that this only allows access to fields and methods.
It does not allow copying, moving, or modifying the original object directly.

Let's break down what is happening in this transaction.

First, we issue a capability to the private `HelloAsset` object in `/storage/`:

```cadence
    let capability = account.capabilities.storage.issue<&HelloWorld.HelloAsset>(/storage/HelloAssetTutorial)
```

To create a capability, we use the `Account.capabilities.issue()` method to issue a new capability to an object in storage.
The type contained in `<>` is the reference type that the capability represents.
The capability says that whoever borrows a reference from this capability has access to the fields and methods
that are specified by the type and entitlements in `<>`.
The specified type has to be a subtype of the type of the object being linked to,
meaning that it cannot contain any fields or functions that the linked object doesn't have.

A reference is referred to by the `&` symbol. Here, the capability references the `HelloAsset` object,
so we specify `<&HelloWorld.HelloAsset>` as the type, which gives access to everything in the `HelloAsset` object.

The argument to the `issue` function is the path to the object in storage that is to be linked to.
When a capability is issued, [a capability controller](../language/accounts/capabilities#accountcapabilities) is created for it
in `Account.Capabilities`, which allows the
creator of the capability to have fine-grained control over the capability.

Capabilities usually link to objects in the `/storage/` domain,
but can also be created for `Account` objects. Account capabilities will not be covered in this tutorial.

After issuing the capability, it can be stored somewhere or in this case, published
to the account's public section with the `account.capabilities.publish()` method.
The caller provides the capability to publish and a public path to publish it at.

To borrow a reference to an object from the capability, we use the capability's `borrow` method.

```cadence
let helloReference = capability.borrow()
    ?? panic("Could not borrow a reference to the hello capability")
```

This method creates the reference as the type we specified in `<>` in the `issue` function.
While borrowing the reference, we use
[optional chaining](../language/composite-types.mdx#accessing-fields-and-functions-of-composite-types-using-optional-chaining)
because the borrowing of the reference could fail.
The reference could be `nil` if the targeted storage slot is empty, is already borrowed,
or if the requested type exceeds what is allowed by the capability.
We panic with a descriptive error message so the caller can know better what went wrong.

Additionally, the owner of an object can effectively [revoke capabilities](../language/accounts/capabilities#revoking-capabilities)
they have created by using the `delete` method on the Capability Controller
that was created for the capability when it was issued.

Additionally, if the referenced object in storage is moved, capabilities that have been created from that storage path are invalidated.

You can find more [detailed documentation about capabilities in the language reference.](../language/capabilities.md)

Now, anyone can call the `hello()` method on your `HelloAsset` object by borrowing a reference with your public capability in `/public/Hello`!
(Covered in the next section)

Lastly, we call the `hello()` method with our borrowed reference:

```cadence
// Call the hello function using the reference to the HelloAsset resource
log(helloReference.hello())
```

At the end of the transaction execution, the `helloReference` value is lost,
but that is ok because while it references a resource, it isn't the actual resource itself, so it is ok to lose it.

In the next section, we look at how capabilities can expand the access a script has to an account.

### Executing Scripts

---

A script is a very simple transaction type in Cadence that cannot perform
any writes to the blockchain and can only read the state of an account or contract.

To execute a script, write a function called `access(all) fun main()`.
You can click the execute script button to run the script.
The result of the script will be printed to the console output.

<Callout type="info">

Open the file `Get Greeting`.

<br />

`Get Greeting` should look like the following:

</Callout>

```cadence get_greeting.cdc
import HelloWorld from 0x01

access(all)
fun main(): String {

    // Cadence code can get an account's public account object
    // by using the getAccount() built-in function.
    let helloAccount = getAccount(0x01)

    // Borrow the public capability from the public path of the owner's account
    let helloReference = helloAccount.capabilities
        .borrow<&HelloWorld.HelloAsset>(/public/HelloAssetTutorial)
        ?? panic("Could not borrow a reference to the HelloAsset capability")

    // The log built-in function logs its argument to stdout.
    //
    // Here we are using optional chaining to call the "hello"
    // method on the HelloAsset resource that is referenced
    // in the published area of the account.
    return helloReference.hello()
}
```

Here's what this script does:
1. It gets a public `Account` reference with `getAccount`
   and assigns it to the variable `helloAccount`.
2. Borrows a reference using the `borrow` method for the capability
   from the `Create Link` transaction and assigns it to `helloReference`.
3. Returns the result of the `hello()` function from `helloReference` to the caller.

```cadence
let helloAccount = getAccount(0x01)
```

The `&Account` reference is available to anyone in the network for every account,
but only has access to a small subset of functions that can be read from the `/public/` domain in an account.

Then, the script borrows the capability that was created in `Create Link`.

```cadence
// Borrow the public capability from the public path of the owner's account
let helloReference = helloAccount.capabilities
    .borrow<&HelloWorld.HelloAsset>(/public/HelloAssetTutorial)
    ?? panic("Could not borrow a reference to the HelloAsset capability")
```

To borrow a capability that is stored in an account, use the `account.capabilities.borrow()` function.
`borrow()` returns a reference to the storage object that the capability targets.
The borrow will return `nil` if the capability does not exist,
the capabilities target storage path does not store a value,
or the value cannot be borrowed with the given type.

Then, the script uses the reference to call the `hello()` function and returns the result.

Let's execute the script to see it run correctly.

<Callout type="info">

Click the `Execute` button in the playground.

</Callout>

<img src="https://storage.googleapis.com/flow-resources/documentation-assets/cadence-tuts/playground-execute.png" />

You should see something like this print:

```
> Result > "Hello, World"
```

Good work!
Your script ran successfully.

One other really cool feature of scripts is that since they can't actually change anything on chain,
they can access any accounts' private storage and objects.
This allows scripts even more power to understand the full state of the chain
and it is safe because they can't actually make any changes.
Also, everything on-chain is publicly readable anyway,
so it is a logical feature for a blockchain programming language to have.

A script can get the `&Account` reference for an account address using the built-in `getAuthAccount()` function:

```cadence
view fun getAuthAccount<T: &Account>(_ address: Address): &T
```

The caller needs to specify which entitlements they want in `<>`
for which parts of the account they want to access. See such an example below:
```cadence
access(all) fun main(address: Address) {
    let entitledAccount = getAuthAccount<auth(BorrowValue) &Account>(address)
}
```

See the [language reference](../language/accounts) for more information about accounts.

## Reviewing Capabilities

This tutorial expanded on the idea of resources in Cadence by expanding access scope to a resource using capabilities
and covering more account storage API use-cases.

You deployed a smart contract with a resource, then created a capability to grant access to that resource.
With the capability, you used the borrow method to create a reference and used the reference to call the
resource's `hello()` function.
Finally, you used a script to borrow the same capability and create a reference so that the script can
call the resource's `hello()` function. This is important because script's cannot access account storage
without using capabilities.

Now that you have completed the tutorial, you have the basic knowledge to write a simple Cadence program that can:
- Implement a resource in a smart contract
- Create capabilities to grant access to resources in an account
- Interact with resources using both signed transactions and scripts

Feel free to modify the smart contract to create different resources,
experiment with the available [account storage API](../language/accounts/storage.mdx),
and write new transactions and scripts that execute different functions from your smart contract.
Have a look at the [capability-based access control page](../language/capabilities.md)
to find out more about what you can do with capabilities.

You're on the right track to building more complex applications with Cadence,
now is a great time to check out the [Cadence Best Practices document](../design-patterns.md)
and [Anti-patterns document](../anti-patterns.md) as your applications become more complex.
