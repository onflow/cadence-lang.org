---
title: Introduction to Cadence
sidebar_position: 1
sidebar_label: Introduction
---

In a blockchain environment like Flow, programs that are stored and executed onchain are referred to as smart contracts. A smart contract programmatically verifies and executes the performance of a contract without the need for a trusted third party. Many people think of it as code-as-law.  

They control and execute important functionality such as the creation and management of currency, buying and selling of digital property, and the execution of contractual agreements without having to rely on a central authority (like a bank).

All of this happens on the same shared computer that anyone can use and no one can shut down or exercise admin control.

## A new programming language

Cadence is a resource-oriented programming language that introduces new features to smart contract programming, which help developers ensure that their code is safe, secure, clear, and approachable. Some of these features are:

- Type safety and a strong static type system.
- Resource-oriented programming — a new paradigm that pairs linear types with object capabilities to create a secure and declarative model for digital ownership by ensuring that resources (which are used to represent scarce digital assets) can only exist in one location at a time, cannot be copied, and cannot be accidentally lost or deleted.
- Built-in pre-conditions and post-conditions for functions and transactions.
- The utilization of capability-based security, which enforces that access to objects is restricted to only the owner of the object and those who have a valid reference to it. This is Cadence's main form of access control.

Cadence’s syntax is inspired by popular modern general-purpose programming languages like [Swift], [Kotlin], and [Rust]. Its use of resource types maps well to that of [Move], the programming language used by Aptos and Sui, though Flow provides greater fine-grained permission control with Capabilities.

## Cadence's programming language pillars

Cadence, a new high-level programming language, observes the following requirements:

- **Safety and security:** Safety is the underlying reliability of any smart contract (i.e., it’s bug-free and performs its function). Security is the prevention of attacks on the network or smart contracts (i.e., unauthorized actions by malicious actors). Safety and security are critical in smart contracts because of the immutable nature of blockchains and because they often deal with high-value assets. While auditing and reviewing code will be a crucial part of smart contract development, Cadence maximizes efficiency while maintaining the highest levels of safety and security at its foundation. It accomplishes this via a strong static type system, design by contract, and ownership primitives inspired by linear types (which are useful when dealing with assets).

- **Clarity:** Code needs to be easy to read, and its meaning should be as unambiguous as possible. It should also be suited for verification so that tooling can help with ensuring safety and security guarantees. These guarantees can be achieved by making the code declarative and allowing the developer to express their intentions directly. We make those intentions explicit by design, which, along with readability, make auditing and reviewing more efficient, at a small cost to verbosity.

- **Approachability:** Writing code and creating programs should be as approachable as possible. Incorporating features from languages like Swift and Rust, developers should find Cadence’s syntax and semantics familiar. Practical tooling, documentation, and examples enable developers to start creating programs quickly and effectively.

- **Developer experience:** The developer should be supported throughout the entire development lifecycle, from initial application logic to onchain bug fixes.

- **Intuiting ownership with resources:** Resources are a composite data type, similar to a struct, that expresses direct ownership of assets. Cadence’s strong static type system ensures that resources can only exist in one location at a time and cannot be copied or lost because of a coding mistake. Most smart contract languages currently use a ledger-style approach to record ownership, where an asset like a fungible token is stored in the smart contract as an entry in a central ledger. Cadence’s resources directly tie an asset’s ownership to the account that owns it by saving the resource in the account’s storage. As a result, ownership isn’t centralized in a smart contract’s storage. Each account owns its assets, and the assets can be transferred freely between accounts without the need for arbitration by a central smart contract.

## Addressing challenges with existing languages

Other languages pioneered smart contract development, but they lack in areas that affect the long-term viability of next-generation applications.

### Safety

Safety is the reliability of a smart contract to perform its function as intended. It is heavily influenced by the _unchangeable-once-deployed_ nature of smart contracts: Developers must take certain precautions in order to avoid introducing any potentially catastrophic vulnerabilities prior to publishing a smart contract on the blockchain. It is standard across many blockchains that modifying or updating a smart contract, even to fix a vulnerability, is not allowed. Thus, any bugs that are present in the smart contract will exist forever.

For example, in 2016, an overlooked vulnerability in an Ethereum Decentralized Autonomous Organization (DAO) smart contract saw millions of dollars siphoned from a smart contract, eventually leading to a fork in Ethereum and two separate active blockchains (Ethereum and Ethereum Classic).

Bug fixes are only possible if a smart contract is designed to support changes, a feature that introduces complexity and security issues. Lengthy auditing and review processes can ensure a bug-free smart contract. Still, they add substantial time to the already time-consuming task of getting the smart contract’s core logic working correctly.

Overlooked mistakes cause the most damaging scenarios. It is easy to lose or duplicate monetary value or assets in existing languages because they don’t check relevant invariants or make it harder to express them. For example, a plain number represents a transferred amount that can be accidentally (or maliciously) multiplied or ignored.

Some languages also express behaviors that developers tend to forget about. For example, a fixed-range type might express monetary value, without considerations for a potential overflow or underflow. In Solidity, Ethereum's smart contract language, an overflow originally caused the value to wrap around, as shown [here]. Solidity also allows contracts to declare variables without initializing them, and doesn't have a `null` or `undefined` value.  Even more confusing, the `mapping` type automatically includes values at all possible entries - `0`, `false`, or whatever the default value is for that type.

Cadence is type-safe and has a strong static type system, which prevents important classes of erroneous or undesirable program behavior at compile-time (i.e., before the program is run onchain). Types are checked statically and are not implicitly converted. Cadence also improves the safety of programs by preventing arithmetic underflow and overflow, introduces optionals to make nil-cases explicit, and always requires variables to be initialized. This helps ensure the behavior of these smart contracts is apparent and not dependent on context.

### Security

Security, in combination with safety, ensures the successful execution of a smart contract over time by preventing unsanctioned access and guaranteeing that only authorized actions can be performed in the protocol. In some languages, functions are public by default, creating vulnerabilities that allow malicious users to find attack vectors. Cadence utilizes capability-based security, which allows the type system to enforce access control based on rules that users and developers have control over.

Security is a consideration when interacting with other smart contracts. Any external call potentially allows malicious code to be executed. For example, in Solidity, when the called function signature does not match any of the available ones, it triggers Solidity’s fallback functions. These functions can be used in malicious ways. Language features such as multiple inheritances and overloading or dispatch can also make it difficult to determine which code is invoked.

In Cadence, the safety and security of programs are enhanced by **Design By Contract** and **Ownership Primitives.** Design by contract allows developers to state pre-conditions and post-conditions for functions and interfaces in a declarative manner so that callers can be certain about the behavior of called code. Ownership primitives are inspired by linear types and increase safety when working with assets. They ensure that valuable assets are, for example, not accidentally or maliciously lost or duplicated.

### Clarity and approachability

Implicitness, context-dependability, and expressiveness are language-based challenges that developers often encounter. They affect the clarity (i.e., the readability of code and the ability to determine its intended function) and the approachability (i.e., the ability to interpret or write code) of the language and the programs built using it. For example, in Solidity, storage must be implemented in a low-level key-value manner, which obfuscates the developer’s intentions. Syntax confusion is another example, with "=+" being legal syntax leading to an assignment instead of a probably-intended increment. Solidity also has features with uncommon behaviors that can lead to unintended results.

[Multiple inheritance may lead to unexpected behaviours in the program], and testing and auditing the code is unlikely to identify this issue.

The Ethereum blockchain’s code immutability showcases the need for considerations around extensibility and mechanisms that allow ad-hoc fixes. Developers using custom-made approaches, such as the 'data separation' approach to upgradability, may run into problems with the complexity of data structures, while developers using '`delegate_call`-based proxies' may run into problems with the consistency of memory layouts. Either way, these challenges compromise approachability and overall extensibility. Cadence has [contract upgradability built in by default], and contracts can be made immutable by removing all keys from an account.

Cadence improves the clarity and extensibility of programs by utilizing interfaces to allow extensibility, code reuse, and interoperability between contracts. Cadence modules also have configurable and transparent upgradeability built in to enable projects to test and iterate before making their code immutable.

Cadence allows the use of argument labels to describe the meaning of function arguments. It also provides a rich standard library with useful data structures (e.g., dictionaries, sets, and so on) and data types for common use cases, like fixed-point arithmetic, which helps when working with currencies.

## Intuiting ownership with resources

Most smart contract languages currently use a ledger-style approach to record ownership, where an asset is stored in the smart contract as an entry in a central ledger, and this ledger is the source of truth around asset ownership. There are many disadvantages to this design, especially when it comes to tracking the ownership of multiple assets belonging to a single account. To find out all of the assets that an account owns, you would have to enumerate all the possible smart contracts that could potentially include this account and search to see if the account owns these assets.

In a resource-oriented language like Cadence, resources directly tie an asset to the account that owns it by saving the resource in the account’s storage. As a result, ownership isn’t centralized in a single, central smart contract’s storage. Instead, each account owns and stores its own assets, and the assets can be transferred freely between accounts without the need for arbitration by a central smart contract.

Resources are inspired by linear types and increase safety when working with assets, which often have real, intrinsic value. Resources, as enforced by Cadence’s type system, ensure that assets are correctly manipulated and not abused.

- Every resource has exactly one owner. If a resource is used as a function parameter, an initial value for a variable, or something similar, the object is not copied. Instead, it is moved to the new location, and the old location is immediately invalidated.
- The language will report an error if ownership of a resource was not properly transferred, i.e., when the program attempts to introduce multiple owners for the resource or the resource ends up in a state where it does not have an owner. For example, a resource can only be assigned to exactly one variable and cannot be passed to functions multiple times.
- Resources cannot go out of scope. If a function or transaction removes a resource from an account’s storage, it either needs to end the transaction in an account's storage, or it needs to be explicitly and safely deleted. There is no "garbage collection" for resources.

The special status of resource objects must be enforced by the runtime; if they were just a compiler abstraction it would be easy for malicious code to break the value guarantees.

Resources change how assets are used in a programming environment to better resemble assets in the real world. Users store their currencies and assets in their own account, in their own wallet storage, and they can do with them as they wish. Users can define custom logic and structures for resources that give them flexibility with how they are stored. Additionally, because everyone stores their own assets, the calculation and charging of state rent is fair and balanced across all users in the network.

## An interpreted language

Currently, Cadence is an interpreted language, as opposed to a compiled language. This means that there is no Cadence Assembly, bytecode, compiler, or Cadence VM.

The structure of the language lends itself well to compilation (e.g., static typing), but using an interpreter for the first version allows us to refine the language features more quickly as we define them.

## Getting started with Cadence

Now that you've learned about the goals and design of Cadence and Flow, you're ready to get started with the Flow emulator and tools! Go to the [Getting Started] page to work through language fundamentals and tutorials.

<!-- Relative links.  Will not render on the page -->

[Swift]: https://developer.apple.com/swift/
[Kotlin]: https://kotlinlang.org/
[Rust]: https://www.rust-lang.org/
[Move]: https://medium.com/coinmonks/overview-of-move-programming-language-a860ffd8f55d
[here]: https://ethfiddle.com/CAp-kQrDUP
[Multiple inheritance may lead to unexpected behaviours in the program]: https://medium.com/consensys-diligence/a-case-against-inheritance-in-smart-contracts-d7f2c738f78e
[contract upgradability built in by default]: ./language/contract-updatability.md
[Getting Started]: ./tutorial/01-first-steps.md
