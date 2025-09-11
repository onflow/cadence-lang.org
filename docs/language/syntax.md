---
title: Syntax and Glossary
sidebar_position: 1
---

This comprehensive glossary provides detailed explanations and code examples for the most important syntax, symbols, operators, keywords, functions, and concepts in Cadence. Each entry includes a clear description of the feature's purpose, usage patterns, and common scenarios, helping both new and experienced developers quickly understand Cadence's unique resource-oriented programming model.

Use this guide as a complete reference to navigate Cadence's syntax, resource management, access control, and blockchain-specific features.

## Comments

Comments can be used to document code. A comment is text that is not executed.

_Single-line comments_ start with two slashes (`//`). These comments can go on a line by themselves, or they can go directly after a line of code:

```cadence
// This is a comment on a single line.
// Another comment line that is not executed.

let x = 1  // Here is another comment after a line of code.
```

_Multi-line comments_ start with a slash and an asterisk (`/*`) and end with an asterisk and a slash (`*/`):

```cadence
/* This is a comment which
spans multiple lines. */
```

Comments may be nested:

```cadence
/* /* this */ is a valid comment */
```

Multi-line comments are balanced:

```cadence
/* this is a // comment up to here */ this is not part of the comment */
```

### Documentation comments

Documentation comments (also known as _doc-strings_ or _doc-comment_) are a special set of comments that can be processed by tools (e.g., to generate human-readable documentation or provide documentation in an IDE).

Doc-comments either start with three slashes (`///`) on each line or are surrounded by `/**` and `**/`:

```cadence
/// This is a documentation comment for `x`.
/// It spans multiple lines.

let x = 1
```

```cadence
/**
  This is a documentation comment
  which also spans multiple lines.
**/
```

## Identifiers

Identifiers can start with any upper or lowercase letter (A-Z, a-z) or an underscore (`_`). This may be followed by zero or more upper and lower case letters, underscores, and numbers (0-9). Identifiers can **not** begin with a number:

```cadence
// Valid: title-case
//
PersonID

// Valid: with underscore
//
token_name

// Valid: leading underscore and characters
//
_balance

// Valid: leading underscore and numbers
_8264

// Valid: characters and number
//
account2

// Invalid: leading number
//
1something

// Invalid: invalid character #
_#1

// Invalid: various invalid characters
//
!@#$%^&*
```

### Reserved identifiers

The following identifiers are reserved, as they are keywords of the language:

- `if`, `else`, `while`, `for`, `in`, `as`
- `break`, `continue`, `return`
- `true`, `false`, `nil`
- `let`, `var`
- `create`, `destroy`, `emit`
- `fun`, `pre`, `post`,
- `auth`, `access`
- `self`, `init`
- `contract`, `event`, `struct`, `resource`, `interface`, `entitlement`, `enum`, `mapping`, `attachment`, `result`
- `transaction`, `prepare`, `execute`
- `switch`, `case`, `default`
- `import`, `include`
- `require`, `requires`, `static`, `native`, `pub`, `priv`, `try`, `catch`, `finally`, `goto`, `const`, `export`, `throw`, `throws`, `where`, `final`, `internal`, `typealias`, `repeat`, `guard`, `is`

### Conventions

By convention, variables, constants, and functions have lowercase identifiers, and types have title-case identifiers.

## Symbols and operators

### `&` (ampersand)

The `&` (ampersand) symbol creates [references] to values in Cadence, allowing you to access data without moving it. When used at the beginning of an expression, it creates a reference to a value, which can be either authorized (with the `auth` modifier) or unauthorized. Authorized references include entitlements that specify what operations can be performed on the referenced value, while unauthorized references provide read-only access. The ampersand is also used in [logical AND operations] when doubled (`&&`), allowing boolean expressions to be combined with short-circuit evaluation.

```cadence
let a: String = "hello"
let refOfA: &String = &a as &String
let authRef: auth(X) &String = &a as auth(X) &String
let result = true && false // logical AND
```

### `@` (at symbol)

The `@` (at) symbol is a crucial resource type annotation in Cadence that indicates a type is a [resource] rather than a regular value. Resources in Cadence are unique, non-copyable types that must be explicitly moved between variables, functions, and storage locations. The `@` symbol must appear at the beginning of the type declaration, emphasizing that the entire type acts as a resource. This annotation is required for resource instantiation, function parameters, return types, and variable declarations involving resources.

```cadence
resource NFT {
    access(all) var id: UInt64
    access(all) var metadata: String
}

let myNFT: @NFT <- create NFT(id: 1, metadata: "Rare item")
fun transfer(nft: @NFT) { /* resource handling */ }
```

### `:` (colon)

The `:` (colon) symbol serves multiple purposes in Cadence syntax. It's primarily used for type annotations, allowing you to explicitly declare the type of variables, constants, function parameters, and return types. The colon also appears in [ternary conditional operators] to separate the _then_ and _else_ branches, providing a concise way to write conditional expressions. Additionally, colons are used in access modifiers and entitlement declarations to specify access control and authorization requirements.

```cadence
let value: Int = 42 // type annotation
fun calculate(x: Int, y: Int): Int { return x + y } // parameter and return types
let result = condition ? value1 : value2 // ternary operator
```

### `=` (equals)

The `=` (equals) symbol is the assignment operator in Cadence, used to assign values to variables and constants. For regular values (non-resources), the equals sign performs a copy assignment, creating a new copy of the value. For resources, the equals sign cannot be used directly; instead, the move operator `<-` must be used to explicitly transfer ownership. The equals sign is also used in constant declarations with `let` and variable declarations with `var`, and it appears in comparison operations when doubled (`==`) for equality testing.

```cadence
let constant = 5 // constant declaration
var mutable = 10 // variable declaration
mutable = 15 // assignment
let isEqual = a == b // equality comparison
```

### `!` (exclamation mark)

The `!` (exclamation mark) symbol has two distinct uses depending on its position relative to a value. When placed before a boolean expression, it performs logical negation, inverting the truth value of the expression. When placed after an optional value, it performs [force unwrapping], extracting the contained value from the optional or causing a runtime panic if the optional is nil. Force unwrapping should be used carefully as it can cause program termination, and safer alternatives like nil-coalescing (`??`) or optional binding should be preferred when possible.

```cadence
let isTrue = true
let isFalse = !isTrue // logical negation
let optionalValue: Int? = 42
let unwrapped = optionalValue! // force unwrap (dangerous if nil)
```

### `/` (forward slash)

The `/` (forward slash) symbol serves as both a mathematical [division operator] and a path separator in Cadence. In arithmetic expressions, it performs division between numeric values, returning the quotient. In [path] expressions, it separates the components of storage paths, which are used to access data in account storage. Paths follow the format `/domain/identifier` where domain can be `storage` or `public`, and the identifier specifies the specific storage location or capability.

```cadence
let quotient = 10 / 2 // arithmetic division
let storagePath = /storage/myResource // storage path
let publicPath = /public/myCapability // public path
```

### `<-` (move operator)

The [`<-` (move operator)] is essential for resource management in Cadence, explicitly indicating when a [resource] is being transferred from one location to another. Unlike regular values that are copied, resources must be moved using this operator to maintain their uniqueness and prevent accidental duplication. The move operator is required when creating resources, assigning them to variables, passing them as function arguments, returning them from functions, or storing them in account storage. This explicit movement ensures that resources follow Cadence's linear type system and prevents resource leaks or double-spending scenarios.

```cadence
resource Token {
    access(all) var amount: UInt64
}

let token <- create Token(amount: 100) // resource creation
let newOwner <- token // resource transfer
fun mint(): @Token { return <- create Token(amount: 50) } // resource return
```

### `<-!` (force-assignment move operator)

The [`<-!` (force-assignment move operator)] is a specialized move operator that moves a resource into an optional variable, but only if the variable is currently nil. If the target variable already contains a resource, the operation will abort the program execution. This operator is useful for ensuring that optional resource variables are only assigned once, providing a safety mechanism against accidental overwrites. It's commonly used in initialization patterns where you want to guarantee that a resource is only moved into an empty optional container.

```cadence
resource NFT {
    access(all) var id: UInt64
}

var myNFT: @NFT? <- nil
myNFT <-! create NFT(id: 1) // succeeds because myNFT is nil
// myNFT <-! create NFT(id: 2) // would abort because myNFT is not nil
```

### `<->` (swap operator)

The [`<->` (swap operator)] exchanges two resources between variables without requiring a temporary variable. This operator is particularly useful for resource management scenarios where you need to swap ownership of two resources atomically. The swap operation is guaranteed to be atomic and cannot fail, making it ideal for scenarios where you need to exchange resources in a single operation. This operator is commonly used in trading scenarios, resource reallocation, or any situation where two parties need to exchange resources simultaneously.

```cadence
resource Coin {
    access(all) var value: UInt64
}

let coinA: @Coin <- create Coin(value: 10)
let coinB: @Coin <- create Coin(value: 20)
coinA <-> coinB // now coinA has value 20, coinB has value 10
```

### `+`, `-`, `*`, `%` (arithmetic operators)

The [arithmetic operators] `+`, `-`, `*`, and `%` perform standard mathematical operations on numeric types in Cadence. The plus operator (`+`) adds two values, the minus operator (`-`) subtracts the right operand from the left, the asterisk operator (`*`) multiplies two values, and the percentage sign (`%`) returns the remainder of division. These operators work with all numeric types including `Int`, `UInt`, `Int8`, `UInt8`, and so on, and follow standard operator precedence rules. Cadence also supports compound assignment operators like `+=`, `-=`, `*=`, and `%=` for more concise code. Cadence does not support the increment/decrement operators `++`, `--`.

```cadence
let sum = 5 + 3 // addition
let difference = 10 - 4 // subtraction
let product = 6 * 7 // multiplication
let remainder = 17 % 5 // modulo
var value = 10
value += 5 // compound assignment
```

### `?` (question mark)

The `?` (question mark) symbol has multiple uses in Cadence, primarily for optional types and conditional operations. When following a type, it creates an optional type that can either contain a value or be nil, providing a safe way to handle potentially missing values. In [ternary conditional expressions], the question mark separates the condition from the _then_ branch. The question mark is also used in the [nil-coalescing operator (`??`)] to provide a default value when an optional is nil, and in optional chaining to safely access properties or call methods on optional values.

```cadence
let optionalInt: Int? = nil // optional type
let result = condition ? value1 : value2 // ternary operator
let safeValue = optionalInt ?? 0 // nil-coalescing
let length = optionalString?.length // optional chaining
```

### `_` (underscore)

The `_` (underscore) symbol serves multiple purposes in Cadence syntax. It can be used in identifiers and variable names to improve readability, particularly for separating words in compound names. In numeric literals, underscores can be used as separators to make large numbers more readable without affecting their value. When used as an argument label in [function] declarations, the underscore indicates that no argument label is required when calling the function, allowing for more natural function calls. The underscore is also used in pattern matching to ignore specific values or in unused variable declarations.

```cadence
let user_name = "Alice" // identifier separator
let large_number = 1_000_000 // numeric separator
fun double(_ x: Int): Int { return x * 2 } // no argument label
let result = double(5) // no label needed
```

### `;` (semicolon)

The `;` (semicolon) symbol is used as a separator between declarations and statements. A semicolon can be placed after any declaration and statement, but can be omitted between declarations if only one statement appears on the line.

```cadence
// Declare a constant, without a semicolon.
//
let a = 1

// Declare a variable, with a semicolon.
//
var b = 2;

// Declare a constant and a variable on a single line, separated by semicolons.
//
let d = 1; var e = 2
```

## Punctuation marks

### `.` (dot/period)

The `.` (dot) symbol serves multiple purposes in Cadence syntax. It's primarily used for member access, allowing you to access properties, methods, and nested types of objects and types. The dot operator is used to call functions on objects, access struct and resource fields, and navigate through nested structures. Dots are also used in decimal numbers to separate the integer and fractional parts, and in qualified type names to specify the namespace or module where a type is defined.

```cadence
let length = "hello".length // member access
let balance = token.balance // property access
token.transfer(amount: 10) // method call
let decimal = 3.14 // decimal number
let nft: MyContract.NFT // qualified type name
```

### `,` (comma)

The `,` (comma) symbol is used to separate multiple items in lists, function parameters, type parameters, and other multi-item contexts in Cadence. Commas separate function arguments, array elements, dictionary key-value pairs, and type parameters in generic declarations. They're also used to separate multiple variable declarations in a single statement and to separate multiple return values in tuple types. Proper comma usage is essential for clear, readable code structure.

```cadence
fun add(a: Int, b: Int, c: Int): Int { return a + b + c } // function parameters
let array = [1, 2, 3, 4, 5] // array elements
let dict = {"key1": "value1", "key2": "value2"} // dictionary pairs
let a, b, c = 1, 2, 3 // multiple declarations
let tuple: (Int, String, Bool) // tuple type
```

### `()` (parentheses)

The `()` (parentheses) symbol has multiple uses in Cadence syntax. They're used to group expressions and control operator precedence in mathematical and logical expressions. Parentheses are required around function parameters in function calls. They also serve to group conditions in control flow statements and to create type annotations for function types. Parentheses are essential for disambiguating complex expressions and ensuring proper evaluation order.

```cadence
let result = (a + b) * c // expression grouping
fun calculate(x: Int, y: Int): Int { return x + y } // function parameters
let functionType: (Int, Int) -> Int // function type
if (condition1 && condition2) { /* code */ } // grouped condition
```

### `<>` (angle brackets)

Angle brackets (`<>`) are _not_ used for generics like in many other languages — Cadence doesn't have traditional generic functions or structs — but they _are_ used in a few specific syntactic contexts related to type parameters and type instantiation. Specifically, angle brackets are used to specify type parameters for certain built-in or standard library types that are type constructors. Angle brackets are also used to specify the borrow type when working with capabilities and when specifying the authorized type with some Cadence APIs. You can also use angle brackets to define explicit element types for collections.

```cadence
// FungibleToken.Vault is a generic composite type in the standard interface.
// <ExampleToken.Vault> tells Cadence the concrete vault type to use:

let vault: FungibleToken.Vault<ExampleToken.Vault>

// The Capability<...> is a generic capability type:
let cap: Capability<&ExampleToken.Vault{FungibleToken.Receiver}>

// Inside <...>, you define the type that will be borrowed when
// using the capability. For example:
let receiverCap: Capability<&ExampleToken.Vault{FungibleToken.Receiver}>
    = account.getCapability<&ExampleToken.Vault{FungibleToken.Receiver}>(/public/receiver)

// No < > = Cadence infers; With < > = you're explicitly
// telling it the type:
let vaultRef = account
    .getCapability<&ExampleToken.Vault{FungibleToken.Receiver}>(/public/receiver)
    .borrow()
let numbers: [Int] = []
let moreNumbers = [] as [Int]

// The type annotation uses square brackets for collections,
// but when inside other parameterized types, < > is used:
let dict: {String: Int} = {}
let capDict: {String: Capability<&ExampleToken.Vault>} = {}
// Here, the < > is within Capability<...> inside the dictionary value type.
```

### `{}` (curly brackets)

The `{}` (curly brackets) symbol is used to define code blocks, scopes, and composite data structures in Cadence. They're used to group statements in functions, control flow statements, and resource/struct definitions. Curly brackets are also used to create dictionary literals and to define the body of functions, initializers, and methods. They establish the scope for variable declarations and control the lifetime of local variables and borrowed references.

```cadence
fun example() {
    let localVar = 42 // code block
    if condition {
        // nested block
    }
}

resource NFT {
    access(all) var id: UInt64 // resource definition
    init(id: UInt64) {
        self.id = id // initializer block
    }
}

let dict = {"key": "value"} // dictionary literal
```

### `[]` (square brackets)

The `[]` (square brackets) symbol is used for array operations and type annotations in Cadence. They're used to create array literals, access array elements by index, and specify array types in type annotations. Square brackets are also used in dictionary key access and to specify the size of fixed-size arrays. They're essential for working with collections and implementing array-based data structures and algorithms.

```cadence
let array = [1, 2, 3, 4, 5] // array literal
let firstElement = array[0] // array access
let arrayType: [String] // array type annotation
let fixedArray: [Int; 5] // fixed-size array
let dict = {"key": "value"}
let value = dict["key"] // dictionary access
```

### `` ` `` (backtick)

The `` ` `` (backtick) symbol is _not_ used and has no syntactic meaning at all in Cadence syntax.

When working with string declarations, use double quotes (`" "`) instead:

```cadence
let s = `hello`  // Error: use double quotes for strings
let s = "hello"
```

### Whitespace

Whitespace has no semantic meaning in Cadence syntax. It is used only to separate tokens.

## Keywords and access control

### `access`

The `access` keyword is fundamental to Cadence's access control system, specifying who can access and modify declarations like variables, functions, and types. Access modifiers include `access(all)` for public access, `access(contract)` for contract-scoped access, `access(account)` for account-scoped access, and `access(self)` for private access. The access keyword can also be used with entitlements to create fine-grained authorization systems, allowing specific operations only when the caller has the required entitlements. This system ensures that resources and sensitive data are protected according to the principle of least privilege.

```cadence
access(all) var publicVariable: String
access(contract) fun contractOnlyFunction() { }
access(account) resource PrivateResource { }
access(E) fun authorizedFunction() { } // requires entitlement E
```

### `let`

The `let` keyword declares immutable constants in Cadence, creating values that cannot be modified after initialization. Constants declared with `let` must be initialized with a value when declared, and their type can be explicitly specified or inferred from the initial value. For resources, `let` constants still require the move operator (`<-`) for assignment, and the resource cannot be moved out of the constant once assigned. The `let` keyword is preferred over `var` when a value doesn't need to change, as it provides compile-time guarantees about immutability and can enable compiler optimizations.

```cadence
let constantValue = 42 // immutable constant
let typedConstant: String = "Hello" // explicit type
let resourceConstant: @NFT <- create NFT(id: 1) // immutable resource
```

### `var`

The `var` keyword declares mutable variables in Cadence, allowing values to be modified after initialization. Variables declared with `var` can be reassigned new values of the same type, and for resources, they can be moved in and out using the move operators. The `var` keyword is essential for maintaining state in contracts and resources, allowing data to be updated as the program executes. Like `let`, the type can be explicitly specified or inferred, and access modifiers can be applied to control who can read or modify the variable.

```cadence
var mutableValue = 10 // mutable variable
mutableValue = 20 // can be reassigned
var resourceVariable: @Token? <- nil // mutable resource variable
resourceVariable <- create Token(amount: 100) // can be assigned
```

### `fun`

The `fun` keyword declares functions in Cadence, which are reusable blocks of code that can accept parameters and return values. Functions can be declared at the top level, within contracts, resources, or structs, and their access level determines who can call them. Functions can accept both regular values and resources as parameters, and they can return values, resources, or nothing (void). The function signature includes parameter types, return type, and access modifiers, and functions can be overloaded based on parameter types and labels.

```cadence
access(all) fun add(a: Int, b: Int): Int {
    return a + b
}

access(contract) fun transfer(token: @Token, to: Address) {
    // resource transfer logic
}
```

### `resource`

The `resource` keyword declares resource types in Cadence, which are unique, non-copyable types that represent digital assets or scarce resources. Resources must be explicitly created, moved, and destroyed, and they cannot be duplicated or lost accidentally. Resources can contain both regular values and other resources, and they can define functions (methods) that operate on the resource's data. The resource keyword is central to Cadence's resource-oriented programming model, ensuring that digital assets follow the same rules as physical assets in terms of ownership and transfer.

```cadence
resource NFT {
    access(all) var id: UInt64
    access(all) var owner: Address

    init(id: UInt64, owner: Address) {
        self.id = id
        self.owner = owner
    }

    access(all) fun transfer(to: Address) {
        self.owner = to
    }
}
```

### `struct`

The `struct` keyword declares structure types in Cadence, which are composite types that group related data together. Unlike resources, structs are copyable and follow value semantics, meaning they are duplicated when assigned or passed as parameters. Structs can contain fields of various types, including other structs, and they can define functions that operate on the struct's data. Structs are commonly used for organizing data that doesn't represent unique assets, such as metadata, configuration, or temporary data structures.

```cadence
struct Metadata {
    access(all) var name: String
    access(all) var description: String
    access(all) var tags: [String]

    init(name: String, description: String, tags: [String]) {
        self.name = name
        self.description = description
        self.tags = tags
    }
}
```

### `contract`

The `contract` keyword declares smart contracts in Cadence, which are the primary unit of deployment and organization for blockchain code. Contracts can contain resources, structs, functions, and other declarations, and they provide a namespace for organizing related functionality. Contracts are deployed to specific accounts and can interact with each other through interfaces and capabilities. The contract keyword is essential for creating reusable, composable blockchain applications that can be deployed and upgraded independently.

```cadence
access(all) contract MyContract {
    access(all) resource NFT {
        access(all) var id: UInt64
        init(id: UInt64) { self.id = id }
    }

    access(all) fun mintNFT(id: UInt64): @NFT {
        return <- create NFT(id: id)
    }
}
```

### `interface`

The `interface` keyword declares interface types in Cadence, which define a contract for what methods and properties a type must implement. Interfaces enable polymorphism and allow different types to be used interchangeably as long as they implement the required interface. Interfaces can declare function signatures, property requirements, and resource requirements, and they can be used as types for parameters, return values, and variables. The interface keyword is crucial for creating flexible, reusable code that can work with multiple implementations.

```cadence
access(all) interface Transferable {
    access(all) fun transfer(to: Address)
    access(all) var owner: Address
}

access(all) resource NFT: Transferable {
    access(all) var owner: Address

    access(all) fun transfer(to: Address) {
        self.owner = to
    }
}
```

### `attachment`

The `attachment` keyword declares [attachment types] in Cadence, which allow developers to extend struct or resource types (even ones they did not create) with new functionality without requiring the original author to plan for the intended behavior. Attachments are declared using the syntax `attachment <Name> for <Type>: <Conformances> { ... }` and can only be declared with `all` access. The attachment's kind (struct or resource) is automatically determined by the type it extends. Attachments are not first-class values and cannot exist independently of their base value, but they can be created using `attach` expressions, accessed via type indexing, and removed using `remove` statements.

```cadence
access(all) resource R {
    access(all) let x: Int
    init(x: Int) { self.x = x }
}

access(all) attachment A for R {
    access(all) let derivedX: Int
    init(scalar: Int) {
        self.derivedX = base.x * scalar
    }
}

// Creating and using attachments
let r <- create R(x: 5)
let r2 <- attach A(scalar: 3) to <-r
let attachmentRef = r2[A] // access attachment via type indexing
```

### `enum`

The `enum` keyword declares [enumeration] types in Cadence, which define a set of named constant values. Enums can contain simple cases, and they provide [type safety] by ensuring only valid enum values can be used. Enums are commonly used for representing states, types, or categories in a program. The enum keyword helps create more readable and maintainable code by replacing magic numbers or strings with meaningful named constants.

```cadence
access(all) enum Status: UInt8 {

    access(all)
    case pending

    access(all)
    case active

    access(all)
    case completed
}

let status: Status = Status.active
```

## Resource management functions

### `create`

The `create` keyword is used to instantiate new resources in Cadence, calling the resource's initializer to set up the new instance. The create keyword must be used with the move operator (`<-`) to assign the newly created resource to a variable or return it from a function. Resources can only be created within the contract that defines them or through authorized functions, ensuring that resource creation is controlled and auditable. The create keyword is essential for minting new digital assets, creating new instances of resources, and initializing resource hierarchies.

```cadence
resource Token {
    access(all) var amount: UInt64
    init(amount: UInt64) { self.amount = amount }
}

let newToken <- create Token(amount: 100) // resource creation
fun mint(): @Token { return <- create Token(amount: 50) } // creation in function
```

### `destroy`

The `destroy` keyword is used to explicitly destroy resources in Cadence, permanently removing them from the system and freeing up any associated storage. The destroy keyword must be used with the move operator (`<-`) to consume the resource being destroyed. Destroying a resource is irreversible and should be done carefully, typically only when the resource is no longer needed or when implementing burning mechanisms for digital assets. The destroy keyword ensures that resources follow a complete lifecycle from creation to destruction, preventing resource leaks.

```cadence
resource Token {
    access(all) var amount: UInt64
    init(amount: UInt64) { self.amount = amount }
}

let token: @Token <- create Token(amount: 100)
destroy token // permanently removes the resource
```

### `.borrow`

The `.borrow` function provides temporary access to a resource without moving it, returning a reference that can be used to read or modify the resource's properties and call its functions. The borrow function is essential for resource management when you need to access a resource's data without transferring ownership. Borrowed references can be either authorized or unauthorized, depending on the access requirements, and they automatically become invalid when the borrowing scope ends. The borrow function is commonly used for reading resource state, calling resource methods, and implementing complex resource interactions.

```cadence
resource NFT {
    access(all) var id: UInt64
    access(all) var metadata: String

    access(all) fun updateMetadata(newMetadata: String) {
        self.metadata = newMetadata
    }
}

let nft: @NFT <- create NFT(id: 1, metadata: "Original")
let ref = &nft as &NFT
ref.updateMetadata("Updated") // borrow and modify
let id = ref.id // borrow and read
```

### `.link`

The `.link` function creates a capability that provides controlled access to a resource or function, allowing other accounts to interact with it through the capability system. The link function specifies the target path, the type of access being granted, and the restrictions on that access. Capabilities can be linked to either public or private storage paths, and they can include entitlements that define what operations are allowed. The link function is fundamental to Cadence's capability-based security model, enabling secure cross-account interactions while maintaining access control.

```cadence
resource NFT {
    access(all) var id: UInt64
    access(all) fun transfer(to: Address) { /* transfer logic */ }
}

let nft: @NFT <- create NFT(id: 1)
account.storage.save(<- nft, to: /storage/myNFT)
account.link<&NFT>(/public/myNFTCap, target: /storage/myNFT) // create capability
```

### `.unlink`

The `.unlink` function removes a capability from account storage, revoking the access that was previously granted through the capability. The unlink function takes the path where the capability was stored and removes it, making the linked resource or function no longer accessible through that capability. This function is important for access control management, allowing accounts to revoke permissions when they're no longer needed or when security requirements change. The unlink function is commonly used in permission management systems and when cleaning up temporary access grants.

```cadence
// Remove a previously linked capability
account.unlink(/public/myNFTCap)
```

### `.getCapability`

The `.getCapability` function retrieves a capability from account storage, allowing you to access the capability's target resource or function. The getCapability function returns an optional capability, which will be nil if no capability exists at the specified path. This function is essential for capability-based programming, allowing accounts to access resources and functions that have been shared with them through the capability system. The getCapability function is commonly used in cross-account interactions and when implementing permission-based access patterns.

```cadence
let capability = account.getCapability<&NFT>(/public/myNFTCap)
if let nftRef = capability.borrow() {
    // Use the borrowed reference
    nftRef.transfer(to: newOwner)
}
```

## Storage and account functions

### `account.storage.save`

The `account.storage.save` function stores a value or resource in account storage at a specified path. This function is essential for persisting data on the blockchain, allowing resources and values to be stored permanently in an account's storage space. The save function requires the move operator (`<-`) for resources and can store both regular values and resources. The storage path must be unique within the account, and the function will overwrite any existing value at that path. This function is commonly used for storing NFTs, tokens, and other digital assets in user accounts.

```cadence
resource NFT {
    access(all) var id: UInt64
    init(id: UInt64) { self.id = id }
}

let nft: @NFT <- create NFT(id: 1)
account.storage.save(<- nft, to: /storage/myNFT) // save resource
account.storage.save("metadata", to: /storage/metadata) // save value
```

### `account.storage.load`

The `account.storage.load` function retrieves a value or resource from account storage at a specified path. This function returns an optional value, which will be nil if no value exists at the specified path or if the type doesn't match. For resources, the load function requires the move operator (`<-`) to transfer ownership from storage to the variable. The load function is essential for accessing stored data and is commonly used in conjunction with save to implement persistent storage patterns.

```cadence
let nft <- account.storage.load<@NFT>(from: /storage/myNFT)
let metadata = account.storage.load<String>(from: /storage/metadata)
```

### `account.storage.borrow`

The `account.storage.borrow` function provides temporary access to a stored resource without moving it from storage. This function returns a reference to the resource that can be used to read or modify the resource's properties and call its functions. The borrow function is useful when you need to access a resource's data without removing it from storage, and it's commonly used for reading resource state or calling resource methods. The borrowed reference becomes invalid when the borrowing scope ends.

```cadence
let nftRef = account.storage.borrow<&NFT>(from: /storage/myNFT)
if let ref = nftRef {
    let id = ref.id // read property
    ref.updateMetadata("New metadata") // call method
}
```

## Type system keywords

### `AnyStruct`

The `AnyStruct` type is a top type in Cadence that can hold any struct value, providing maximum flexibility when you need to work with different struct types. AnyStruct is commonly used in generic containers, event parameters, and situations where you need to store or pass around different types of structs. When using AnyStruct, you typically need to perform type checking or type casting to access the specific properties or methods of the underlying struct. This type is essential for creating flexible, reusable code that can work with various struct types.

```cadence
let anyValue: AnyStruct = "Hello" // can hold any struct
let anotherValue: AnyStruct = 42 // can hold different types
```

### `AnyResource`

The `AnyResource` type is a top type in Cadence that can hold any resource value, allowing you to work with different resource types in a generic way. AnyResource is commonly used in generic containers, capability systems, and situations where you need to store or pass around different types of resources. When using AnyResource, you typically need to perform type checking or type casting to access the specific properties or methods of the underlying resource. This type is essential for creating flexible resource management systems.

```cadence
let anyResource: AnyResource <- create SomeResource()
let anotherResource: AnyResource <- create AnotherResource()
```

### `Void`

The `Void` type represents the absence of a value in Cadence, used when a function doesn't return anything or when you need to explicitly indicate that no value is expected. Functions that don't have a return statement or explicitly return Void are said to return nothing. The Void type is commonly used in function signatures, event definitions, and situations where you need to explicitly indicate that no value is being returned or expected. This type helps make code intentions clear and provides type safety.

```cadence
fun doSomething(): Void {
    // function that doesn't return a value
}

fun anotherFunction() { // implicitly returns Void
    // function body
}
```

### `Never`

The `Never` type represents a function that never returns normally, typically because it always throws an error or aborts execution. The Never type is used in function signatures to indicate that the function will not complete successfully and return a value. This type is commonly used in error handling functions, assertion functions, and functions that perform critical operations that must succeed or fail completely. The Never type helps make error handling explicit and provides compile-time guarantees about function behavior.

```cadence
fun assert(condition: Bool): Never {
    if !condition {
        panic("Assertion failed")
    }
}
```

## Control flow keywords

### `if`

The `if` keyword provides conditional execution in Cadence, allowing code to be executed only when a specified condition is true. If statements can include optional else clauses to handle the case when the condition is false, and they can be chained with else if clauses for multiple conditions. The condition in an if statement must evaluate to a boolean value, and the code blocks can contain any valid Cadence code including variable declarations, function calls, and resource operations. If statements are fundamental to implementing business logic and conditional behavior in smart contracts.

```cadence
if condition {
    // execute when condition is true
} else if anotherCondition {
    // execute when anotherCondition is true
} else {
    // execute when no conditions are true
}
```

### `while`

The `while` keyword creates loops that execute a block of code repeatedly as long as a specified condition remains true. The condition is evaluated before each iteration, and the loop continues until the condition becomes false. While loops are useful for iterating over data structures, implementing retry logic, and performing operations that need to continue until a certain state is reached. Care must be taken to ensure that while loops eventually terminate to prevent infinite loops that could consume excessive gas.

```cadence
var counter = 0
while counter < 10 {
    // execute while counter is less than 10
    counter = counter + 1
}
```

### `for`

The `for` keyword creates loops for iterating over collections like arrays, dictionaries, and ranges in Cadence. For loops can iterate over the elements of a collection, providing access to each element in sequence. The for keyword is commonly used with the `in` keyword to specify the collection being iterated over, and the loop variable can be used to access the current element. For loops are essential for processing collections of data, implementing batch operations, and performing operations on multiple items.

```cadence
let numbers = [1, 2, 3, 4, 5]
for number in numbers {
    // process each number
}

for i in 0...5 {
    // iterate over range
}
```

### `return`

The `return` keyword exits a function and optionally provides a value to be returned to the caller. The return keyword can be used with or without a value, depending on the function's return type. When used with a value, the value must match the function's declared return type. The return keyword immediately terminates function execution, making it useful for early exits and conditional returns. For functions that return resources, the return keyword must be used with the move operator (`<-`) to transfer ownership of the resource.

```cadence
fun add(a: Int, b: Int): Int {
    return a + b // return with value
}

fun earlyExit(condition: Bool) {
    if condition {
        return // early exit without value
    }
    // continue execution
}
```

## Error handling

### `panic`

The `panic` function immediately aborts the execution of the current transaction with an optional error message. The panic function is used for critical errors that cannot be recovered from, such as assertion failures, invalid state conditions, or security violations. When panic is called, the entire transaction is rolled back, and any changes made during the transaction are discarded. The panic function is commonly used in assertion functions, input validation, and error conditions that indicate a fundamental problem with the program's logic or state.

```cadence
fun assert(condition: Bool, message: String) {
    if !condition {
        panic(message) // abort with error message
    }
}

fun divide(a: Int, b: Int): Int {
    if b == 0 {
        panic("Division by zero") // critical error
    }
    return a / b
}
```

### `pre` and `post`

The `pre` and `post` keywords are used for function [pre-conditions and post-conditions] in Cadence, providing a way to specify requirements and guarantees about function behavior. Pre-conditions (`pre`) specify conditions that must be true before a function is called, while post-conditions (`post`) specify conditions that must be true after the function completes. These conditions are checked at runtime and will cause a panic if they are not satisfied. Pre and post conditions help ensure function correctness and provide documentation about function requirements and guarantees.

```cadence
fun transfer(amount: UInt64): UInt64 {
    pre {
        amount > 0: "Amount must be positive"
    }
    post {
        result > 0: "Result must be positive"
    }
    return amount
}
```

## Events and logging

### `event`

The `event` keyword declares event types in Cadence, which are used to emit structured data that can be indexed and queried by blockchain clients. Events are essential for creating transparent, auditable blockchain applications that can communicate state changes and important occurrences to external systems. Events can contain various data types including structs, resources, and primitive types, and they are emitted using the `emit` keyword. Events are commonly used for tracking transactions, state changes, and important business events in smart contracts.

```cadence
access(all) event TransferEvent(
    from: Address,
    to: Address,
    amount: UInt64
)

fun transfer(to: Address, amount: UInt64) {
    // transfer logic
    emit TransferEvent(from: self.owner, to: to, amount: amount)
}
```

### `emit`

The `emit` keyword is used to emit events in Cadence, broadcasting structured data to the blockchain network for indexing and querying by external systems. The emit keyword is followed by an event instance and any parameters that the event requires. Emitted events are permanently recorded on the blockchain and can be used for auditing, analytics, and triggering external processes. The emit keyword is commonly used in conjunction with the event keyword to create transparent, auditable blockchain applications.

```cadence
access(all) event NFTMinted(id: UInt64, owner: Address)

fun mintNFT(id: UInt64): @NFT {
    let nft <- create NFT(id: id)
    emit NFTMinted(id: id, owner: self.owner) // emit event
    return <- nft
}
```

## Composite type keywords

### `init`

The `init` keyword declares initializer functions in Cadence, which are special functions that set up new instances of types when they are created. Initializers are called automatically when creating new instances using the `create` keyword for resources or when declaring structs and other types. The init function can accept parameters to configure the new instance, and it's responsible for setting up the initial state of the object. Initializers are essential for ensuring that objects are properly initialized with valid state.

```cadence
resource NFT {
    access(all) var id: UInt64
    access(all) var owner: Address

    init(id: UInt64, owner: Address) {
        self.id = id
        self.owner = owner
    }
}
```

### `self`

The `self` keyword refers to the current instance of a type within its methods and initializers. The self keyword is used to access the current object's properties and methods, distinguishing them from local variables or parameters with the same names. In resource and struct methods, self is used to modify the object's state, access its properties, and call other methods on the same object. The self keyword is essential for object-oriented programming patterns in Cadence.

```cadence
resource Token {
    access(all) var balance: UInt64

    access(all) fun transfer(amount: UInt64) {
        self.balance = self.balance - amount // access own property
    }

    access(all) fun getBalance(): UInt64 {
        return self.balance // return own property
    }
}
```

<!-- Relative links. Will not render on the page -->

[arithmetic operators]: ./operators/arithmetic-logical-operators.md#arithmetic-operators
[division operator]: ./operators/arithmetic-logical-operators.md#arithmetic-operators
[force-assignment move operator `<-!`]: ./operators/assign-move-force-swap.md#force-assignment-operator--
[`<-!` (force-assignment move operator)]: ./operators/assign-move-force-swap.md#force-assignment-operator--
[force unwraps]: ./operators/optional-operators.md#force-unwrap-operator-
[force unwrapping]: ./operators/optional-operators.md#force-unwrap-operator-
[function]: ./functions.mdx
[logical operator (AND)]: ./operators/arithmetic-logical-operators.md#logical-operators
[logical AND operations]: ./operators/arithmetic-logical-operators.md#logical-operators
[move operator `<-`]: ./resources.mdx#the-move-operator--
[`<-` (move operator)]: ./resources.mdx#the-move-operator--
[nil-coalescing operator `??`]: ./operators/optional-operators.md#nil-coalescing-operator-
[nil-coalescing operator (`??`)]: ./operators/optional-operators.md#nil-coalescing-operator-
[path]: ./accounts/paths.mdx
[pre-conditions and post-conditions]: ./pre-and-post-conditions.md
[reference]: ./references.mdx
[references]: ./references.mdx
[resource]: ./resources.mdx
[enumeration]: ./enumerations.md
[swapping operator `<->`]: ./operators/assign-move-force-swap.md#swapping-operator--
[`<->` (swap operator)]: ./operators/assign-move-force-swap.md#swapping-operator--
[ternary operations]: ./operators/bitwise-ternary-operators.md#ternary-conditional-operator
[ternary conditional operators]: ./operators/bitwise-ternary-operators.md#ternary-conditional-operator
[ternary conditional expressions]: ./operators/bitwise-ternary-operators.md#ternary-conditional-operator
[type safety]: ./types-and-type-system/type-safety.md
[attachment types]: ./attachments.mdx
