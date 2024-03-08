---
title: Intersection Types
sidebar_position: 17
---

Interface types cannot be used in type annotations directly;
instead they must be used as part of intersection types.
An intersection type represents a value that conforms to all of the interfaces listed in the intersection.

The syntax of a intersection type is `{U1, U2, ... Un}`,
where the types `U1` to `Un` are the interfaces that the type conforms to.

The members and functions of any of the set of interfaces are available.

Intersection types are useful for writing functions that work on a variety of different inputs.
For example, by using an intersection type for a parameter's type,
the function may accept any concrete value that implements all the interfaces in that intersection.
The value is restricted to the functionality of the intersection;
if the function accidentally attempts to access other functionality,
this is prevented by the static checker.

```cadence
access(all)
struct interface HasID {
    access(all)
    let id: String
}

access(all)
struct A: HasID {

    access(all)
    let id: String

    init(id: String) {
        self.id = id
    }
}

access(all)
struct B: HasID {

    access(all)
    let id: String

    init(id: String) {
        self.id = id
    }
}

// Create two instances, one of type `A`, and one of type `B`.
// Both types conform to interface `HasID`, so the structs can be assigned
// to variables with type `{HasID}`: Some resource type which only allows
// access to the functionality of resource interface `HasID`

let hasID1: {HasID} = A(id: "1")
let hasID2: {HasID} = B(id: "2")

// Declare a function named `getID` which has one parameter with type `{HasID}`.
// The type `{HasID}` is a short-hand for `AnyStruct{HasID}`:
// Some structure which only allows access to the functionality of interface `HasID`.
//
access(all)
fun getID(_ value: {HasID}): String {
    return value.id
}

let id1 = getID(hasID1)
// `id1` is "1"

let id2 = getID(hasID2)
// `id2` is "2"
```

If more than two interfaces are present in an intersection type,
any concrete value of that type must implement both of them:

```cadence
access(all)
struct interface HasMetadata {
    access(all)
    var metadata: AnyStruct
}

access(all)
struct C: HasID, HasMetadata {

    access(all)
    let id: String
    
    access(all)
    var metadata: AnyStruct

    init(id: String) {
        self.id = id
        self.metadata = []
    }

    access(all)
    fun setMetadata(_ data: AnyStruct) {
        self.metadata = data
    }
}

// valid, because `C` implements both `HasID` and `HasMetadata`.
let hasID3: {HasID, HasMetadata} = C(id: "3")

// Invalid, because `A` implements only `HasID`.
let hasID4: {HasID, HasMetadata} = A(id: "4")
```
