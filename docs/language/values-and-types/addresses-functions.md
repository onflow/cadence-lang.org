---
title: Addresses and Address Functions
sidebar_position: 4
---

## Addresses

The type `Address` represents an address. Addresses are unsigned integers with a size of 64 bits (8 bytes). Hexadecimal integer literals can be used to create address values:

```cadence
// Declare a constant that has type `Address`.
//
let someAddress: Address = 0x436164656E636521

// Invalid: Initial value is not compatible with type `Address`,
// it is not a number.
//
let notAnAddress: Address = ""

// Invalid: Initial value is not compatible with type `Address`.
// The integer literal is valid, however, it is larger than 64 bits.
//
let alsoNotAnAddress: Address = 0x436164656E63652146757265766572
```

Integer literals are not inferred to be an address:

```cadence
// Declare a number. Even though it happens to be a valid address,
// it is not inferred as it.
//
let aNumber = 0x436164656E636521

// `aNumber` has type `Int`
```

An `Address` can also be created using a byte array or string.

```cadence
// Declare an address with hex representation as 0x436164656E636521.
let someAddress: Address = Address.fromBytes([67, 97, 100, 101, 110, 99, 101, 33])

// Invalid: Provided value is not compatible with type `Address`. The function panics.
let invalidAddress: Address = Address.fromBytes([12, 34, 56, 11, 22, 33, 44, 55, 66, 77, 88, 99, 111])

// Declare an address with the string representation as "0x436164656E636521".
let addressFromString: Address? = Address.fromString("0x436164656E636521")

// Invalid: Provided value does not have the "0x" prefix. Returns Nil
let addressFromStringWithoutPrefix: Address? = Address.fromString("436164656E636521")

// Invalid: Provided value is an invalid hex string. Return Nil.
let invalidAddressForInvalidHex: Address? = Address.fromString("0xZZZ")

// Invalid: Provided value is larger than 64 bits. Return Nil.
let invalidAddressForOverflow: Address? = Address.fromString("0x436164656E63652146757265766572")
```

### Address functions

Addresses have multiple built-in functions you can use.

-
    ```cadence
    view fun toString(): String
    ```

    Returns the string representation of the address. The result has a `0x` prefix and is zero-padded.

    ```cadence
    let someAddress: Address = 0x436164656E636521
    someAddress.toString()   // is "0x436164656E636521"

    let shortAddress: Address = 0x1
    shortAddress.toString()  // is "0x0000000000000001"
    ```

-
    ```cadence
    view fun toBytes(): [UInt8]
    ```

    Returns the byte array representation (`[UInt8]`) of the address.

    ```cadence
    let someAddress: Address = 0x436164656E636521

    someAddress.toBytes()  // is `[67, 97, 100, 101, 110, 99, 101, 33]`
    ```

<!-- Relative links. Will not render on the page -->

