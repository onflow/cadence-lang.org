---
title: 9. Voting Contract
---

In this tutorial, we're going to deploy a contract that allows users to vote on multiple proposals that a voting administrator controls.

---

:::info

Open the starter code for this tutorial in the Flow Playground:
<a
href="https://play.flow.com/e8e2af39-370d-4a52-9f0b-bfb3b12c7eff"
target="_blank"
>
https://play.flow.com/e8e2af39-370d-4a52-9f0b-bfb3b12c7eff
</a>
The tutorial will be asking you to take various actions to interact with this code.

:::

:::info[Action]

Instructions that require you to take action are always included in a callout box like this one.
These highlighted actions are all that you need to do to get your code running,
but reading the rest is necessary to understand the language's design.

:::

With the advent of blockchain technology and smart contracts,
it has become popular to try to create decentralized voting mechanisms that allow large groups of users to vote completely on chain.
This tutorial will provide a trivial example for how this might be achieved by using a resource-oriented programming model.

We'll take you through these steps to get comfortable with the Voting contract.

1. Deploy the contract to account `0x06`
2. Create proposals for users to vote on
3. Use a transaction with multiple signers to directly transfer the `Ballot` resource to another account.
4. Record and cast your vote in the central Voting contract
5. Read the results of the vote

Before proceeding with this tutorial, we highly recommend following the instructions in [Getting Started](./01-first-steps.md)
and [Hello, World!](./02-hello-world.md) to learn how to use the Playground tools and to learn the fundamentals of Cadence.

## A Voting Contract in Cadence

In this contract, a Ballot is represented as a resource.

An administrator can give Ballots to other accounts, then those accounts mark which proposals they vote for
and submit the Ballot to the central smart contract to have their votes recorded.

Using a [resource](../language/resources.mdx) type is logical for this application, because if a user wants to delegate their vote,
they can send that Ballot to another account, and the use case of voting ballots benefits from the uniqueness and existence guarantees
inherent to resources.

## Write the Contract

Time to see the contract we'll be working with:

:::info[Action]

1. Open Contract 1 - the `ApprovalVoting` contract.

:::

The contract should have the following contents:

```cadence ApprovalVoting.cdc
/*
*
*   In this example, we want to create a simple approval voting contract
*   where a polling place issues ballots to addresses.
*
*   The run a vote, the Admin deploys the smart contract,
*   then initializes the proposals
*   using the initialize_proposals.cdc transaction.
*   The array of proposals cannot be modified after it has been initialized.
*
*   Then they will give ballots to users by
*   using the issue_ballot.cdc transaction.
*
*   Every user with a ballot is allowed to approve any number of proposals.
*   A user can choose their votes and cast them
*   with the cast_vote.cdc transaction.
*
*.  See if you can code it yourself!
*
*/

access(all)
contract ApprovalVoting {

    // Field: An array of strings representing proposals to be approved

    // Field: A dictionary mapping the proposal index to the number of votes per proposal

    // Entitlement: Admin entitlement that restricts the privileged fields
    // of the Admin resource

    // Resource: Ballot resource that is issued to users.
    // When a user gets a Ballot object, they call the `vote` function
    // to include their votes for each proposal, and then cast it in the smart contract
    // using the `cast` function to have their vote included in the polling
    // Remember to track which proposals a user has voted yes for in the Ballot resource
    // and remember to include proper pre and post conditions to ensure that no mistakes are made
    // when a user submits their vote
    access(all) resource Ballot {

    }

    // Resource: Administrator of the voting process
    // initialize the proposals and to provide a function for voters
    // to get a ballot resource
    // Remember to include proper conditions for each function!
    // Also make sure that the privileged fields are secured with entitlements!
    access(all) resource Administrator {
        
    }

    // Public function: A user can create a capability to their ballot resource
    // and send it to this function so its votes are tallied
    // Remember to include a provision so that a ballot can only be cast once!

    // initialize the contract fields by setting the proposals and votes to empty
    // and create a new Admin resource to put in storage
    init() {
        
    }
}

```

Now is your chance to write some of your own Cadence code!
See if you can follow the instructions in the comments of the contract
to write your own approval voting contract.
Instructions for transactions are also included in the sample transactions.
Once you're done, share your project with the Flow community in the Flow discord! :)

## Deploy the Contract

:::info[Action]

1. In the bottom right deployment modal, press the arrow to expand and make sure account `0x06` is selected as the signer.
2. Click the Deploy button to deploy it to account `0x06`

:::

## Perform Voting

Performing the common actions in this voting contract only takes three types of transactions.

1. Initialize Proposals
2. Send `Ballot` to a voter
3. Cast Vote

We have a transaction for each step that we provide a skeleton of for you.
With the `ApprovalVoting` contract deployed to account `0x06`:

:::info[Action]

1. Open Transaction 1 which should have `Create Proposals`
2. Submit the transaction with account `0x06` selected as the only signer.

:::

```cadence CreateProposals.cdc
import ApprovalVoting from 0x06

// This transaction allows the administrator of the Voting contract
// to create new proposals for voting and save them to the smart contract

transaction {
    // Fill in auth() with the correct entitlements you need!
    prepare(admin: auth()) {

        // borrow a reference to the admin Resource
        // remember to use descriptive error messages!

        // Call the initializeProposals function
        // to create the proposals array as an array of strings
        // Maybe we could create two proposals for the local basketball league:
        // ["Longer Shot Clock", "Trampolines instead of hardwood floors"]

        // Issue and public a public capability to the Administrator resource
        // so that voters can get their ballots!
    }

    post {
        // Verify that the proposals were initialized properly
    }

}
```

This transaction allows the `Administrator` of the contract to create new proposals for voting and save them to the smart contract. They do this by calling the `initializeProposals` function on their stored `Administrator` resource, giving it two new proposals to vote on.
We use the `post` block to ensure that there were two proposals created, like we wished for.

Next, the `Administrator` needs to hand out `Ballot`s to the voters. There isn't an easy `deposit` function this time for them to send a `Ballot` to another account, so how would they do it?

## Putting Resource Creation in public capabilities

Unlike our other tutorial contracts, the Approval Voting contract
puts its Ballot creation function in a resource instead of as a public function in a contract.
This way, the admin can control who can and cannot create a Ballot resource.
There are also ways to consolidate all of the voting logic into the Admin resource
so that there can be multiple sets of proposals being voted on at the same time
without having to deploy a new contract for each one!

Here, we're just exposing the create ballot function through a public capability
for simplicity, so lets use the transaction for a voter to create a ballot.

:::info[Action]

1. Open the `Create Ballot` transaction.
2. Select account `0x07` as a signer.
3. Submit the transaction by clicking the `Send` button

:::

```cadence CreateBallot.cdc

import ApprovalVoting from 0x06

// This transaction allows a user
// to create a new ballot and store it in their account
// by calling the public function on the Admin resource
// through its public capability

transaction {
    // fill in the correct entitlements!
    prepare(voter: auth() &Account) {

        // Get the administrator's public account object
        // and borrow a reference to their Administrator resource

        // create a new Ballot by calling the issueBallot
        // function of the admin Reference

        // store that ballot in the voter's account storage
    }
}

```

After this transaction, account `0x07` should now have a `Ballot` resource
object in its account storage. You can confirm this by selecting `0x07`
from the lower-left sidebar and seeing `Ballot` resource listed under the `Storage` field.

## Casting a Vote

Now that account `0x07` has a `Ballot` in their storage, they can cast their vote.
To do this, they will call the `vote` method on their stored resource,
then cast that `Ballot` by passing it to the `cast` function in the main smart contract.

:::info[Action]

1. Open the `Cast Ballot` transaction.
2. Select account `0x07` as the only transaction signer.
3. Click the `send` button to submit the transaction.

:::

```cadence CastBallot.cdc
import ApprovalVoting from 0x06

// This transaction allows a voter to select the votes they would like to make
// and cast that vote by using the cast vote function
// of the ApprovalVoting smart contract

transaction {
    // fill in the correct entitlements!
    prepare(voter: auth() &Account) {

        // Borrow a reference to the Ballot resource in the Voter's storage
        
        // Vote on the proposal

        // Issue a capability to the Ballot resource in the voter's storage

        // Cast the vote by submitting it to the smart contract
    }

    post {
        // verify that the votes were cast properly
    }
}
```

In this transaction, the user votes for one of the proposals by submitting
their votes on their own ballot and then sending the capability.

## Reading the result of the vote

At any time, anyone could read the current tally of votes by directly reading the fields of the contract. You can use a script to do that, since it does not need to modify storage.

:::info[Action]

1. Open the `Get Votes` script.
2. Click the `execute` button to run the script.

:::

```cadence GetVotes.cdc
import ApprovalVoting from 0x06

// This script allows anyone to read the tallied votes for each proposal
//

// Fill in a return type that can properly represent the number of votes
// for each proposal
// This might need a custom struct to represent the data
access(all) fun main(): {

    // Access the public fields of the contract to get
    // the proposal names and vote counts

    // return them to the calling context

}
```

The return type should reflect the number of votes that were cast for each proposal
with the `Cast Vote` transaction.

## Other Voting possibilities

This contract was a very simple example of voting in Cadence.
It clearly couldn't be used for a real-world voting situation,
but hopefully you can see what kind of features could be added to it to ensure practicality and security.
