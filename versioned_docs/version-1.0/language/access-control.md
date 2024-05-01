---
title: Access control
sidebar_position: 13
---

Access control allows making certain parts of a program accessible/visible
and making other parts inaccessible/invisible.

In Cadence, access control consists of:

1. Access control on objects in account storage,
  using [capability security](./capabilities.md).

  A user is not able to access an object
  unless they own the object or have a reference to that object.
  This means that nothing is truly public by default.

  Other accounts can not read or write the objects in an account
  unless the owner of the account has granted them access
  by providing references to the objects.

  This kind of access control is covered in the pages
  on [capabilities](./capabilities.md)
  and [capability management](./accounts/capabilities.mdx).

2. Access control within contracts and objects,
  using access modifiers (`access` keyword).

This page covers the second part of access control,
using access modifiers.

All declarations, such as [function](./functions.mdx), [composite types](./composite-types.mdx), and fields,
must be prefixed with an access modifier, using the `access` keyword.

The access modifier determines where the declaration is accessible/visible.
Fields can only be assigned to and mutated from within the same or inner scope.

For example, to make a function publicly accessible (`access(all)` is explained below):

```
access(all)
fun test() {}
```

There are five levels of access control:

- **Public access** means the declaration is accessible/visible in all scopes.
  This includes the current scope, inner scopes, and the outer scopes.

  A declaration is made publicly accessible using the `access(all)` modifier.

  For example, a public field in a type can be accessed
  on an instance of the type in an outer scope.

- **Entitled access** means the declaration is only accessible/visible
  to the owner of the object, or to [references](./references.mdx)
  that are authorized to the required [entitlements](#entitlements).

  A declaration is made accessible through entitlements by using the `access(E)` syntax,
  where `E` is a set of one or more entitlements,
  or a single [entitlement mapping](#entitlement-mappings).

  A reference is considered authorized to an entitlement
  if that entitlement appears in the `auth` portion of the reference type.

  For example, an `access(E, F)` field on a resource `R` can only be accessed by an owned (`@R`-typed) value,
  or a reference to `R` that is authorized to the `E` and `F` entitlements (`auth(E, F) &R`).

- **Account access** means the declaration is only accessible/visible
  in the scope of the entire account where it is defined.
  This means that other contracts in the account are able to access it.

  A declaration is made accessible by code in the same account,
  for example other contracts, by using the `access(account)` keyword.

- **Contract access** means the declaration is only accessible/visible
  in the scope of the contract that defined it.
  This means that other declarations that are defined in the same contract can access it,
  but not other contracts in the same account.

  A declaration is made accessible by code in the same contract
  by using the `access(contract)` keyword.

- **Private access** means the declaration is only accessible/visible
  in the current and inner scopes.

  A declaration is made accessible by code in the same containing type
  by using the `access(self)` keyword.

  For example, an `access(self)` field can only be accessed
  by functions of the type is part of, not by code in an outer scope.

To summarize the behavior for variable declarations, constant declarations, and fields:

| Declaration kind | Access modifier    | Accessible in                                        | Assignable in     | Mutable in        |
|:-----------------|:-------------------|:-----------------------------------------------------|:------------------|:------------------|
| `let`            | `access(self)`     | Current and inner                                    | *None*            | Current and inner |
| `let`            | `access(contract)` | Current, inner, and containing contract              | *None*            | Current and inner |
| `let`            | `access(account)`  | Current, inner, and other contracts in same account  | *None*            | Current and inner |
| `let`            | `access(all)`      | **All**                                              | *None*            | Current and inner |
| `let`            | `access(E)`        | **All** with required entitlements                   | *None*            | Current and inner |
| `var`            | `access(self)`     | Current and inner                                    | Current and inner | Current and inner |
| `var`            | `access(contract)` | Current, inner, and containing contract              | Current and inner | Current and inner |
| `var`            | `access(account)`  | Current, inner, and other contracts in same account  | Current and inner | Current and inner |
| `var`            | `access(all)`      | **All**                                              | Current and inner | Current and inner |
| `var`            | `access(E)`        | **All** with required entitlements                   | Current and inner | Current and inner |

Declarations of [composite types](./composite-types.mdx) must be public.
However, even though the declarations/types are publicly visible,
resources can only be created, and events can only be emitted
from inside the contract they are declared in.

```cadence
// Declare a private constant, inaccessible/invisible in outer scope.
//
access(self)
let a = 1

// Declare a public constant, accessible/visible in all scopes.
//
access(all)
let b = 2
```

```cadence
// Declare a public struct, accessible/visible in all scopes.
//
access(all)
struct SomeStruct {

    // Declare a private constant field which is only readable
    // in the current and inner scopes.
    //
    access(self)
    let a: Int

    // Declare a public constant field which is readable in all scopes.
    //
    access(all)
    let b: Int

    // Declare a private variable field which is only readable
    // and writable in the current and inner scopes.
    //
    access(self)
    var c: Int

    // Declare a public variable field which is not settable,
    // so it is only writable in the current and inner scopes,
    // and readable in all scopes.
    //
    access(all)
    var d: Int

    // Arrays and dictionaries declared without (set) cannot be
    // mutated in external scopes
    access(all)
    let arr: [Int]

    // The initializer is omitted for brevity.

    // Declare a private function which is only callable
    // in the current and inner scopes.
    //
    access(self)
    fun privateTest() {
        // ...
    }

    // Declare a public function which is callable in all scopes.
    //
    access(all)
    fun publicTest() {
        // ...
    }

    // The initializer is omitted for brevity.

}

let some = SomeStruct()

// Invalid: cannot read private constant field in outer scope.
//
some.a

// Invalid: cannot set private constant field in outer scope.
//
some.a = 1

// Valid: can read public constant field in outer scope.
//
some.b

// Invalid: cannot set public constant field in outer scope.
//
some.b = 2

// Invalid: cannot read private variable field in outer scope.
//
some.c

// Invalid: cannot set private variable field in outer scope.
//
some.c = 3

// Valid: can read public variable field in outer scope.
//
some.d

// Invalid: cannot set public variable field in outer scope.
//
some.d = 4

// Invalid: cannot mutate a public field in outer scope.
//
some.f.append(0)

// Invalid: cannot mutate a public field in outer scope.
//
some.f[3] = 1

// Valid: can call non-mutating methods on a public field in outer scope
some.f.contains(0)
```

## Entitlements

Entitlements provide granular access control to each member of a composite.
Entitlements are declared using the syntax `entitlement E`,
where `E` is the name of the entitlement.

For example, the following code declares two entitlements called `E` and `F`:

```cadence
entitlement E
entitlement F
```

Entitlements can be imported from other contracts and used the same way as other types.
When using entitlements defined in another contract, the same qualified name syntax is used as for other types:

```cadence
contract C {
    entitlement E
}
```

Outside of `C`, `E` is used with `C.E` syntax.

Entitlements exist in the same namespace as types, so if a contract declares a resource called `R`,
it is impossible to declare an entitlement that is also called `R`.

Entitlements can be used in access modifiers of composite members (fields and functions)
to specify which references to those composites are allowed to access those members.

An access modifier can include more than one entitlement,
joined with either an `|`, to indicate disjunction ("or"),
or a `,`, to indicate conjunction ("and").
The two kinds of separators cannot be combined in the same set.

For example:

```cadence
access(all)
resource SomeResource {

  // requires a reference to have an `E` entitlement to read this field
  access(E)
  let a: Int

  // requires a reference to have either an `E` OR an `F` entitlement to read this field.
  access(E | F)
  let b: Int

   // requires a reference to have both an `E` AND an `F` entitlement to read this field
  access(E, F)
  let c: Int

  // intializers omitted for brevity
  // ...
}
```

Assuming the following constants exist,
which have owned or [reference](./references.mdx) types:

```cadence
let r: @SomeResource = // ...
let refE: auth(E) &SomeResource = // ...
let refF: auth(F) &SomeResource = // ...
let refEF: auth(E, F) &SomeResource = // ...
let refEOrF: auth(E | F) &SomeResource = // ...
```

The references can be used as follows:

```cadence
// valid, because `r` is owned and thus is "fully entitled"
r.a
// valid, because `r` is owned and thus is "fully entitled"
r.b
// valid, because `r` is owned and thus is "fully entitled"
r.c

// valid, because `refE` has an `E` entitlement as required
refE.a
// valid, because `refE` has one of the two required entitlements
refE.b
// invalid, because `refE` only has one of the two required entitlements
refE.c

// invalid, because `refF` has an `E` entitlement, not an `F`
refF.a
// valid, because `refF` has one of the two required entitlements
refF.b
// invalid, because `refF` only has one of the two required entitlements
refF.c

// valid, because `refEF` has an `E` entitlement
refEF.a
// valid, because `refEF` has both of the two required entitlements
refEF.b
// valid, because `refEF` has both of the two required entitlements
refEF.c

// invalid, because `refEOrF` might not have an `E` entitlement (it may have `F` instead)
refEOrF.a
// valid, because `refEOrF` has one of the two entitlements necessary
refEOrF.b
// invalid, because `refEOrF` is only known to have one of the two required entitlements
refEOrF.c
```

Note particularly in this example how the owned value `r` can access all entitled members on `SomeResource`.
Owned values are not affected by entitled declarations. 

Further details about authorized references can be found [here](./references.mdx#authorized-references).

### Entitlement mappings

Entitlement mappings are a way to statically declare how entitlements are propagated
from parents to child objects in a nesting hierarchy.

When objects have fields that are child objects, 
entitlement mappings can be used
to grant access to the inner object based on the entitlements of the reference to the parent object.

Consider the following example,
which uses entitlements to control access to an inner resource:

```cadence
entitlement OuterEntitlement
entitlement InnerEntitlement

resource InnerResource {

    access(all)
    fun foo() { ... }

    access(InnerEntitlement)
    fun bar() { ... }
}

resource OuterResource {
    access(self)
    let childResource: @InnerResource

    init(childResource: @InnerResource) {
        self.childResource <- childResource
    }

    // The parent resource has to provide two accessor functions
    // which return a reference to the inner resource.
    //
    // If the reference to the outer resource is unauthorized
    // and does not have the OuterEntitlement entitlement,
    // the outer resource allows getting an unauthorized reference
    // to the inner resource.
    //
    // If the reference to the outer resource is authorized
    // and it has the OuterEntitlement entitlement,
    // the outer resource allows getting an authorized reference
    // to the inner resource.

    access(all)
    fun getPubRef(): &InnerResource {
        return &self.childResource as &InnerResource
    }

    access(OuterEntitlement)
    fun getEntitledRef(): auth(InnerEntitlement) &InnerResource {
        return &self.childResource as auth(InnerEntitlement) &InnerResource
    }
}
```

With this pattern, it is possible to store a `InnerResource` in an `OuterResource`,
and create different ways to access that nested resource depending on the entitlement one possesses.

An unauthorized reference to `OuterResource` can only be used to call the `getPubRef` function,
and thus can only obtain an unauthorized reference to `InnerResource`.
That reference to the `InnerResource` then only allows calling the function `foo`, which is publicly accessible,
but not function `bar`, as it needs the `InnerEntitlement` entitlement, which is not granted.

However an `OuterEntitlement`-authorized reference to the `OuterResource` can be used to call the `getEntitledRef` function,
which returns a `InnerEntitlement`-authorized reference to `InnerResource`,
which in turn can be used to call function `bar`.

This pattern is functional, but it is unfortunate that the accessor functions to `InnerResource` have to be "duplicated".

Entitlement mappings should be used to avoid this duplication. 

Entitlement mappings are declared using the syntax:

```cadence
entitlement mapping M {
    // ...
}
```

Where `M` is the name of the mapping.

The body of the mapping contains zero or more rules of the form `A -> B`,
where `A` and `B` are entitlements.
Each rule declares that, given a reference with the entitlement on the left,
a reference with the entitlement on the right is produced.

An entitlement mapping thus defines a function from an input set of entitlements (called the domain)
to an output set (called the range or the image).

Using entitlement mappings, the above example could be more concisely written as:

```cadence
entitlement OuterEntitlement
entitlement InnerEntitlement

// Specify a mapping for entitlements called `OuterToInnerMap`,
// which maps the entitlement `OuterEntitlement` to the entitlement `InnerEntitlement`.
entitlement mapping OuterToInnerMap {
    OuterEntitlement -> InnerEntitlement
}

resource InnerResource {
  
    access(all)
    fun foo() { ... }

    access(InnerEntitlement)
    fun bar() { ... }
}

resource OuterResource {
    // Use the entitlement mapping `OuterToInnerMap`.
    //
    // This declares that when the field `childResource` is accessed
    // using a reference authorized with the entitlement `OuterEntitlement`,
    // then a reference with the entitlement `InnerEntitlement` is returned.
    //
    // This is equivalent to the two accessor functions
    // that were necessary in the previous example.
    //
    access(mapping OuterToInnerMap)
    let childResource: @InnerResource

    init(childResource: @InnerResource) {
        self.childResource <- childResource
    }

    // No accessor functions are needed.
}

// given some value `r` of type `@OuterResource`

let pubRef = &r as &OuterResource
let pubInnerRef = pubRef.childResource // has type `&InnerResource`

let entitledRef = &r as auth(OuterEntitlement) &OuterResource
let entitledInnerRef = entitledRef.childResource  // has type `auth(InnerEntitlement) &InnerResource`,
    // as `OuterEntitlement` is defined to map to `InnerEntitlement`.

// `r` is an owned value, and is thus considered "fully-entitled" to `OuterResource`,
// so this access yields a value authorized to the entire image of `OuterToInnerMap`,
// in this case `InnerEntitlement`, and thus can call `bar`
r.childResource.bar()
```

Entitlement mappings can be used either in accessor functions (as in the example above),
or in fields whose types are either references, or containers (composite types, dictionaries, and arrays).

Entitlement mappings need not be 1:1.
It is valid to define a mapping where many inputs map to the same output,
or where one input maps to many outputs.

Entitlement mappings preserve the "kind" of the set they are mapping.
That is, mapping a conjunction ("and") set produces a conjunction set,
and mapping a disjunction ("or") set produces a disjunction set.

Because entitlement separators cannot be combined in the same set,
attempting to map disjunction ("or") sets through certain complex mappings can result in a type error.

For example, given the following entitlement mapping:

```cadence
entitlement mapping M {
  A -> B
  A -> C
  D -> E
}
```

Attempting to map `(A | D)` through `M` will fail,
since `A` should map to `(B, C)` and `D` should map to `E`,
but these two outputs cannot be combined into a disjunction ("or") set.

A good example for how entitlement mappings can be used is the [`Account` type](./accounts/index.mdx).

### The `Identity` entitlement mapping

`Identity` is a special built-in entitlement mapping that maps every input to itself as the output.
Any entitlement set passed through the `Identity` map will come out unchanged in the output.

For instance:

```cadence
entitlement X

resource InnerResource {
    // ...
}

resource OuterResource {
    access(mapping Identity)
    let childResource: @InnerResource

    access(mapping Identity)
    getChildResource(): auth(mapping Identity) &InnerResource {
        return &self.childResource
    }

    init(childResource: @InnerResource) {
        self.childResource <- childResource
    }
}

fun example(outerRef: auth(X) &OuterResource) {
    let innerRef = outerRef.childResource // `innerRef` has type `auth(X) &InnerResource`,
        // as `outerRef` was authorized with entitlement `X`
}
```

One important point to note about the `Identity` mapping, however,
is that its full output range is unknown, and theoretically infinite.
Because of that,
accessing an `Identity`-mapped field or function with an owned value will yield an empty output set.

For example, calling `getChildResource()` on an owned `OuterResource` value,
will produce an unauthorized `&InnerResource` reference.

### Mapping composition

Entitlement mappings can be composed.
In the definition of an entitlement mapping,
it is possible to include the definition of one or more other mappings,
to copy over their mapping relations.

An entitlement mapping is included into another entitlement mapping using the `include M` syntax,
where `M` is the name of the entitlement mapping to be included.

In general, an `include M` statement in the definition of an entitlement mapping `N`
is equivalent to simply copy-pasting all the relations defined in `M` into `N`'s definition.

Support for `include` is provided primarily to reduce code-reuse and promote composition.

For example:

```cadence
entitlement mapping M {
  X -> Y
  Y -> Z
}

entitlement mapping N {
  E -> F
}

entitlement mapping P {
  include M
  include N
  F -> G
}
```

The entitlement mapping `P` includes all of the relations defined in `M` and `N`,
along with the additional relations defined in its own definition.

It is also possible to include the `Identity` mapping.
Any mapping `M` that includes the `Identity` mapping will map its input set to itself,
along with any additional relations defined in the mapping,
or in other included mappings.

For instance:

```cadence
entitlement mapping M {
    include Identity
    X -> Y
}
```

The mapping `M` maps the entitlement set `(X)` to `(X, Y)`,
and `(Y)` to `(Y)`.

Includes that produce a cyclical mapping are rejected by the type-checker.

### Built-in mutability entitlements

A prominent use-case of entitlements is to control access to object based on mutability.

For example, in a composite, the author would want to control the access to certain fields to be read-only,
and some fields to be mutable, etc.

In order to support this, the following built-in entitlements can be used:
- `Insert`
- `Remove`
- `Mutate`

These are primarily used by the built-in [array](./values-and-types.mdx#arrays)
and [dictionary](./values-and-types.mdx#dictionaries) functions,
but are available to be used in access modifiers of any declaration.

While Cadence does not support entitlement composition or inheritance,
the `Mutate` entitlement is intended to be used as an equivalent form
to the conjunction of the `(Insert, Remove)` entitlement set.
