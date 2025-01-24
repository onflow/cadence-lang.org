---
archived: false
draft: false
title: Capabilities
description: An introduction to capabilities and how they interact with resources in Cadence
date: 2024-12-11
meta:
  keywords:
    - tutorial
    - Flow
    - Cadence
    - Resources
    - Capabilities
    - Capability
tags:
  - reference
  - cadence
  - tutorial
socialImageTitle: Cadence Resources
socialImageDescription: Capability smart contract image.
---

This tutorial will build on your understanding of [accounts] and [resources]. You'll learn how to interact with resources using [capabilities] and [entitlements].

:::tip[Reminder]

In Cadence, resources are a composite type like a struct or a class, but with some **special rules**:
- Each instance of a resource can only exist in exactly one location and cannot be copied.
- Resources must be explicitly moved from one location to another when accessed.
- Resources also cannot go out of scope at the end of function execution, they must be explicitly stored somewhere or destroyed.

:::

## Objectives

After completing this tutorial, you'll be able to:

* Interact with [resources] created using transactions.
* Write transactions to create [capabilities] to extend resource access scope from the owner to anyone (`public`).
* Write and execute a script that interacts with the resource through the capability.

## Use-Cases for Capabilities and Entitlements

Let's look at why you would want to use capabilities and entitlements to expand access to resources in a real-world context. A real user's account and stored objects will contain functions and fields that need varying levels of access scope and privacy.

If you're working on an app that allows users to exchange tokens, you'll want different features available in different use cases. While you definitely want to make a feature like withdrawing tokens from an account only accessible by the owner of the tokens, your app should allow anybody to deposit tokens.

Capabilities and entitlements are what allows for this detailed control of access to owned assets. They allow a user to indicate which of the functionality of their account and owned objects should be accessible to themselves, their trusted friends, and the public.

For example, a user might want to allow a friend of theirs to use some of their money to spend, in this case, they could create an entitled capability that gives the friend access to only this part of their account, instead of having to hand over full control.

Another example is when a user authenticates a trading app for the first time, the trading app could ask the user for a capability object that allows the app to access the trading functionality of a user's account so that the app doesn't need to ask the user for a signature every time it wants to do a trade.  The user can choose to empower the app, and that app alone, for this functionality and this functionality alone.

## Accessing Resources with Capabilities

As a smart contract developer, you need explicit permission from the owner of an account to access its [storage]. Capabilities allow an account owner to grant access to specific fields and functions on objects stored in their account.

First, you'll write a transaction in which you'll issue a new capability using the `issue` function. This capability creates a link to the user's `HelloAsset` resource object. It then publishes that link to the account's public space, so others can access it.

Next, you'll write a script that anyone can use that link to borrow a [reference] to the underlying object and call the `hello()` function.

## Creating Capabilities and References to Stored Resources

:::info[Action]

Continue working with your code from the previous tutorial.  Alternately, open a fresh copy here:
<a
  href="https://play.flow.com/64287da4-50c4-4580-8b9f-5792b78d77c3"
  target="_blank"
>
  https://play.flow.com/64287da4-50c4-4580-8b9f-5792b78d77c3
</a>

:::

:::info[Action]

If you started with a fresh playground, be sure to deploy the `HelloWorld` contract with account `0x06` and call the `Create Hello` transaction, also with `0x06`.

:::

### Prepare the Account Capabilities

:::info[Action]

Create a new transaction called `Create Link`.

Import `HelloWorld` and stub out a `transaction` with a `prepare` phase.

:::

:::tip

Cadence allows for static analysis of imported contracts.  You'll get errors in the transactions and scripts that import `HelloWorld` from `0x06` if you haven't deployed that contract.

:::

```cadence create_link.cdc
import HelloWorld from 0x06

transaction {
  prepare() {
    // TODO
  }
}
```

:::info[Action]

Next, pass an `&Account` reference into `prepare` with the capabilities needed to give the `transaction` the ability to create and publish a capability.

:::

```cadence create_link.cdc
import HelloWorld from 0x06

transaction {
  prepare(account: auth(
    IssueStorageCapabilityController,
    PublishCapability
  ) &Account) {
    // TODO
  }
}
```

The [`IssueStorageCapabilityController`] allows the transaction to [issue] a new capability, which includes storing that capability to the user's account.  [`PublishCapability`] allows the transaction to [publish] a capability and make it available to other users - in this case, we'll make it public.

### Capability Based Access Control

[Capabilities] allow the owners of objects to specify what functionality of their private objects is available to others. Think of it kind of like an account's API, if you're familiar with the concept.

The account owner has private objects stored in their storage, like their collectibles or their money, but they might still want others to be able to see what collectibles they have in their account, or they want to allow anyone to access the deposit functionality for a certain asset.

Since these objects are stored in private storage by default, the owner has to authorize something to open up access to these while still retaining full control.

We create capabilities to accomplish this, and the account owner must sign a transaction to [issue] and [publish] them.

Every capability has a `borrow` method, which creates a reference to the object that the capability is linked to. This reference is used to read fields or call methods on the object they reference, **as if the owner of the reference had the actual object**.

It is important to remember that someone else who has access to a capability cannot move or destroy the object that the capability is linked to! They can only access fields that the owner has explicitly declared in the type specification and authorization-level of the [issue] method.

### Issue the Capability

Capabilities are created with the [issue] function and can be stored in variables or constants.

:::info[Action]

Issue a capability to allow access to the instance of the `HelloAsset` [resource] the `Create Hello` transaction saved in `/storage/HelloAssetTutorial`.

:::

```cadence
let capability = account
  .capabilities
  .storage
  .issue<&HelloWorld.HelloAsset>(/storage/HelloAssetTutorial)
```

:::danger

In our example capability, we had the user sign a transaction that gave public access to **everything** found in the `HelloAsset` resource!

When you're writing real transactions, follow the principle of giving minimal access.  While the capability cannot move or destroy an object, it might be able to mutate data inside of it in a way that the owner does not desire.

For example, if you added a function to allow the owner of the resource to change the greeting message, this code would open that function up to anyone and everyone!

:::

```cadence
let capability = account
  .capabilities
  .storage
  .issue<&HelloWorld.HelloAsset>(/storage/HelloAssetTutorial)
```

The capability says that whoever borrows a reference from this capability has access to the fields and methods that are specified by the type and entitlements in `<>`. The specified type has to be a subtype of the type of the object being linked to, meaning that it cannot contain any fields or functions that the linked object doesn't have.

A reference is referred to by the `&` symbol. Here, the capability references the `HelloAsset` object, so we specify `<&HelloWorld.HelloAsset>` as the type, which gives access to **everything** in the `HelloAsset` object.

The argument to the `issue` function is the path to the object in storage that is to be linked to. When a capability is issued, a [capability controller] is created for it in `account.capabilities`. This controller allows the creator of the capability to have fine-grained control over the capability.

Capabilities usually link to objects in the `/storage/` domain,
but can also be created for `Account` objects. Account capabilities will not be covered in this tutorial.

### Publish the Capability

Now that your transaction has created the capability with the [issue] function and saved it in a constant, you can use the [publish] function to store the capability in a place where it can be used by anyone.

:::info[Action]

Use [publish] function to publish the `capability` at `/public/HelloAssetTutorial`.

:::

```cadence
account.capabilities.publish(capability, at: /public/HelloAssetTutorial)
```

You should end up with a transaction similar to:

```cadence Create Link.cdc
import HelloWorld from 0x06

transaction {
  prepare(account: auth(
    IssueStorageCapabilityController,
    PublishCapability
  ) &Account) {
    let capability = account
      .capabilities
      .storage
      .issue<&HelloWorld.HelloAsset>(/storage/HelloAssetTutorial)

    account
      .capabilities
      .publish(capability, at: /public/HelloAssetTutorial)
  }
}
```

### Execute the Transaction to Publish the Capability

:::info[Action]

Ensure account `0x06` is still selected as a transaction signer.

Click the `Send` button to send the transaction.  Then, send it a second time.

:::

:::warning

This implementation will work the first time and fail the second.  The object cannot be saved because something is already at the path.

:::

As you learned in the [resources tutorial], Cadence prevents you from writing code that might accidentally overwrite an object in storage, thus mutating or even destroying a piece of your users' digital property.

:::info[action]

On your own, refactor your `Create Link` transaction to elegantly handle a scenario where an object is already stored at `/public/HelloAssetTutorial`

:::

## Using the Capability in a Script

Now that you've published the capability with `public` `access`, anyone who wants to can write transactions or scripts that make use of it.

:::info[Action]

Create a script called `GetGreeting`. Import `HelloWorld` and give it public `access`.

:::

```cadence GetGreeting.cdc
import HelloWorld from 0x06

access(all) fun main(): String {
  // TODO
}
```

You'll need a reference to the public account object for the `0x06` account to be able to access public capabilities within it.

:::info[Action]

Use `getAccount` to get a reference to account `0x06`.  Hardcode it for now.

:::

```cadence
let helloAccount = getAccount(0x06)
```

:::warning

Addresses are **not** strings and thus do **not** have quotes around them.

:::

:::info[Action]

Next, `borrow` the public capability your `Create Link` transaction saved in `/public/HelloAssetTutoral`.

Your script should return `return helloReference.hello()`.

:::

You've already borrowed something before.  Try to implement this on your own.  **Hint:** this time you're borrowing a `capability` from the account, **not** something from `storage`.  Don't forget to handle the case where the object can't be found!

You should end up with a script similar to:

```cadence GetGreeting.cdc
import HelloWorld from 0x06

access(all) fun main(): String {
    let helloAccount = getAccount(0x06)

    let helloReference = helloAccount
        .capabilities
        .borrow<&HelloWorld.HelloAsset>(/public/HelloAssetTutorial)
        ?? panic("Could not borrow a reference to the HelloAsset capability")

    return helloReference.hello()
}
```

:::info[Action]

`Execute` your script.

:::

You'll see `"Hello, World!"` logged to the console.

Note that scripts don't need any authorization and can only access public information.  You've enabled the user to make this capability public through the transaction you wrote and they signed.

At the end of the script execution, the `helloReference` value is lost, but that is ok because while it references a resource, it isn't the actual resource itself. It's ok to lose it.

## Deleting Capabilities

:::danger

While most apps will need to depend on users storing resource that allow the user to interact with the app, avoid constructing your app logic such that it depends on something in a user's storage for important metadata.  They own their storage and can delete anything in it at any time without asking anyone.

For example, if you stored the amount of debt for tokens you'd lent a user as a standalone resource in their account, they could simply delete the storage and erase the debt. Instead, store that metadata in your smart contract.

:::

The owner of an object can effectively [revoke capabilities] they have created by using the `delete` method on the Capability Controller that was created for the capability when it was issued.

Additionally, if the referenced object in storage is moved, capabilities that have been created from that storage path are invalidated.

## Reviewing Capabilities

This tutorial expanded on the idea of resources in Cadence by expanding access scope to a resource using capabilities and covering more account storage API use-cases.

You deployed a smart contract with a resource, then created a capability to grant access to that resource. With the capability, you used the `borrow` method in a script to create a reference to the capability.  You then used the reference to call the resource's `hello()` function. This is important because scripts cannot access account storage without using capabilities.

Now that you have completed the tutorial, you should be able to:

* Interact with [resources] created using transactions.
* Write transactions to create [capabilities] to extend resource access scope from the owner to anyone (`public`).
* Write and execute a script that interacts with the resource through the capability.

You're on the right track to building more complex applications with Cadence. Now is a great time to check out the [Cadence Best Practices document], [Anti-patterns document], and the first NFT tutorial!

<!-- Reference-style links, will not render on page -->

[accounts]: ../language/accounts/index.mdx
[storage]: ../language/accounts/storage.mdx
[resources]: ../language/resources.mdx
[resource]: ../language/resources.mdx
[capabilities]: ../language/capabilities.md
[Capabilities]: ../language/capabilities.md
[entitlements]: ../language/access-control.md#entitlements
[reference]: ../language/references.mdx
[`IssueStorageCapabilityController`]: ../language/accounts/capabilities.mdx#accountstoragecapabilities-and-accountaccountcapabilities
[`PublishCapability`]: /language/accounts/capabilities.mdx#accountcapabilities
[issue]: ../language/accounts/capabilities.mdx#issuing-capabilities
[publish]: ../language/accounts/capabilities.mdx#publishing-capabilities
[resources tutorial]: ./03-resources.md
[capability controller]: ../language/accounts/capabilities.mdx#accountcapabilities
[revoke capabilities]: ../language/accounts/capabilities.mdx#revoking-capabilities
[Cadence Best Practices document]: ../design-patterns.md
[Anti-patterns document]: ../anti-patterns.md