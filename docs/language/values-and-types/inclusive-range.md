---
title: InclusiveRange
sidebar_position: 9
---

An `InclusiveRange<T: Integer>` value represents a range of numerical values between two integers, with the start and end numbers included in the range as suggested by the name. 

A range value has a `start`, `end`, and a `step`, which represents the interval at which the range's values are separated from `start` to `end`.  

A range can be created using the `InclusiveRange` constructor, which can take two or three arguments. 

In the case where the range is constructed with two arguments, the first argument is the `start` and the second is the `end`. The `step` is inferred to be either `1` (when `end >= start`) or `-1` (when `end < start`). For example:

```cadence
// start is 1, end is 100, step is 1
let range: InclusiveRange<UInt> = InclusiveRange(1, 100)
```

Optionally a third, labeled, non-zero `step` argument can be provided to specify a step other than `1`. For example, the following range contains all odd numbers from 1 to 100:

```cadence
// start is 1, end is 100, step is 2
let range: InclusiveRange<UInt> = InclusiveRange(1, 100, step: 2)
```

Note that in this example, even though the specified _end_ of the range is 100, the last actual value the range can attain is 99.

If the specified `step` argument would progress the range away from the `end`, the creation will fail. For example:

```cadence
// Throws an error because a step of -2 cannot progress from 1 to 100
let range: InclusiveRange<Int> = InclusiveRange(1, 100, step: -2)
```

A range requires a type annotation when created. 

## InclusiveRange fields and functions

A value of type `InclusiveRange<T>`, where `T` is a number type, has the following fields and functions:

- 
    ```cadence
    let start: T
    ```

    The start of the range.

    ```cadence
    // Declare a range of `Int`s
    let range = let r: InclusiveRange<Int> = InclusiveRange(3, 9)

    // Get the start of the range
    let start = range.start

    // `start` is `3`
    ```

- 
    ```cadence
    let end: T
    ```

    The end of the range.

    ```cadence
    // Declare a range of `Int`s
    let range: InclusiveRange<Int> = InclusiveRange(3, 9)

    // Get the end of the range
    let end = range.end

    // `end` is `9`
    ```

- 
    ```cadence
    let step: T
    ```

    The step of the range.

    ```cadence
    // Declare a range of `Int`s with a `step` of 2
    let rangeWithStep: InclusiveRange<Int> = InclusiveRange(3, 9, step: 2)

    // Get the step of the range
    var step = range.step

    // `step` is `2`

    // Declare a range of `Int`s without an explicit `step`
    let rangeWithStep: InclusiveRange<Int> = InclusiveRange(3, 9)

    / Get the step of the range
    step = rangeWithStep.step

    // `step` is implicitly `1`
    ```

- 
    ```cadence
    access(all)
    view fun contains(_ element: T): Bool
    ```

    Returns `true` if the given integer is in the `InclusiveRange` sequence, and `false` otherwise.

    Specifically, for some `InclusiveRange` `r` defined with `start`, `step`, and `end`, `r.contains(x)` returns true if either:

        - `start <= end` and there exists some integer `i >= 0` such that `start + i * step = x` and `x <= end`
        - `start > end`  and there exists some integer `i >= 0` such that `start - i * step = x` and `x >= end`

    ```cadence
    // Declare a range of `Int`s with a `step` of 2
    let rangeWithStep: InclusiveRange<Int> = InclusiveRange(3, 9, step: 2)

    // `contains` is `true`
    var contains = range.contains(5)

     // `contains` is `true`
    var contains = range.contains(9)

    // `contains` is `false`
    contains = range.contains(6)

     // `contains` is `false`
    contains = range.contains(11)
    ```

## Usage in loops
See [Ranges in loops] for more information.

<!-- Relative links. Will not render on the page -->
[Ranges in loops]: ../control-flow.md#ranges-in-loops
