---
title: Enumerations
sidebar_position: 15
---

Enumerations are sets of symbolic names bound to unique, constant values, which can be compared by identity.

## Enum declaration

Enums are declared using the `enum` keyword, followed by the name of the enum, the raw type after a colon, and the requirements, which must be enclosed in opening and closing braces.

The raw type must be an integer subtype (e.g., `UInt8` or `Int128`).

Enum cases are declared using the `case` keyword, followed by the name of the enum case.

Enum cases must be unique. Each enum case has a raw value, which is the index of the case among all cases.

The raw value of an enum case can be accessed through the `rawValue` field.

The enum cases can be accessed by using the name as a field on the enum or by using the enum constructor, which requires providing the raw value as an argument. The enum constructor returns the enum case with the given raw value, if any, or `nil` if no such case exists.

Enum cases can be compared using the equality operators `==` and `!=`.

## Working with an enum declaration

1. Declare an enum named `Color`, which has the raw value type `UInt8`, and declare three enum cases (`red`, `green`, and `blue`):

   ```cadence
   access(all)
   enum Color: UInt8 {

       access(all)
       case red

       access(all)
       case green
    
       access(all)
       case blue
   }
   ```

1. Declare a variable that has the enum type `Color` and initialize it to the enum case `blue` of the enum:

   ```cadence
   let blue: Color = Color.blue
   ```

1. Get the raw value of the enum case `blue`. Since it is the third case, it has an index of 2:

   ```cadence
   blue.rawValue // is `2`
   ```

1. Get the `green` enum case of the enum `Color` by using the enum constructor and providing the raw value of the enum case `green`, 1. Since the enum case `green` is the second case, it has an index of 1:

   ```cadence
   let green: Color? = Color(rawValue: 1)  // is `Color.green`
   ```

1. Get the enum case of the enum `Color` with the raw value 5. As there are only three cases, the maximum raw value/index is 2:

   ```cadence
   let nothing = Color(rawValue: 5)  // is `nil`
   ```

   Enum cases can be compared:

   ```cadence
   Color.red == Color.red  // is `true`
   Color(rawValue: 1) == Color.green  // is `true`
   ```

   Different enum cases are not the same:

   ```cadence
   Color.red != Color.blue  // is `true`
   ```
