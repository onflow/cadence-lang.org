---
title: Flow Smart Contract Project Development Standards
sidebar_label: Development Standards
sidebar_position: 7
description: "Learn how to effectively organize and manage a Cadence project"
---

# Smart Contract Project Development Standards

## Context

Smart Contracts are the bedrock piece of security for many important parts of the Flow blockchain, as well as for any project that is deployed to a blockchain.

They are also the most visible technical parts of any project, since users will be querying them for data, building other smart contracts that interact with them, and using them as learning materials and templates for future projects. Furthermore, when deployed, they are publicly available code on the blockchain and often also in public GitHub repos.

Therefore, the process around designing, building, testing, documenting, and managing these projects needs to reflect the critical importance they hold in the ecosystem.

Every software project strikes a balance between effort spent on product/feature delivery vs. the many other demands of the software development lifecycle, whether testing, technical debt, automation, refactoring, or documentation, and so on. Building in Web3, we face the same trade-offs but in a higher-risk and consequence environment than what is typical for most software. A mismanaged or untested smart contract may result in **significant** financial losses as a result of vulnerabilities that were overlooked and then exploited. We highly recommend that builders adopt these best practices to help mitigate these risks.

If they do so, they will be able to build better smart contracts, avoid potential bugs, support user and third-party adoption of their projects, and increase their chances of success by being a model for good software design. Additionally, the more projects that adopt good software design and management standards, the more this behavior normalizes, encouraging other projects in the ecosystem to do the same, which creates a healthier and more vibrant community.

Ensuring appropriate levels of testing results in better smart contracts, which have proactively modeled threats and engineered against them. Ensuring appropriate levels of standards adoption (e.g., [FungibleToken], [NFT StoreFront], and so on) by onchain app builders amplifies the network effects for all in the ecosystem. NFTs in one onchain app can be readily consumed by other apps through onchain events with no new integration required. With your help and participation, we can further accelerate healthy and vibrant network effects across the Flow ecosystem!

Some of these suggestions might seem somewhat unnecessary, but it is important to model what a project can do to manage its smart contracts the best so that hopefully all of the other projects follow suit.

This also assumes standard software design best practices also apply. Indeed, many of these suggestions are more general software design best practices, but there may be others that are assumed but not included here.

### Implementing these practices

This document serves mostly as an outline of best practices the projects should follow. As with all best practices, teams will choose which applies to them and their work process; however, we recommend that teams explicitly define a minimum acceptable set of standards for themselves along with the mechanisms to ensure they are being observed.

Some teams may also have their own set of development standards that achieve a similar goal to these. These recommendations are not meant to be the only paths to success, so if a team disagrees with some of these and wants to do things their own way, they are welcome to pursue that. This document just shows some generic suggestions for teams who might not know how they want to manage their project.

## Design process

Smart contracts usually manage a lot of value, have many users, and are difficult to upgrade for a variety of reasons. Therefore, it is important to have a clearly defined design process for the smart contracts before much code is written so that the team can set themselves up for success.

Here are some recommendations for how projects can organize the foundations of their projects.

### Projects should ensure that there is strong technical leadership for their smart contracts

Developing an onchain app requires a clear vision for the role of the smart contract and how it's integrated. Security vulnerabilities may arise from bugs directly in smart contract code (and elsewhere in the system). Asynchronous interaction vectors may lead to forms of malicious abuse, DOS, an so on in a contract, triggering explosive gas costs for the developer or other problems.

We recommend that engineers leading a project and deploying to mainnet have an understanding of software and security engineering fundamentals they've been thorough in their Cadence skills development. More in-depth resources for learning Cadence are available [here].

The technical leader should be someone who understands Cadence well and has written Cadence smart contracts before. Production-level smart contracts are not the place for beginners to get their start.

It should be this person's responsibility to lead design discussions with product managers and the community, write most of the code and tests, solicit reviews, make requested changes, and make sure the project gets completed in a timely manner.

The leader should also understand how to sign transactions with the CLI to deploy/upgrade smart contracts, run admin transactions, troubleshoot problems, and so on. If something goes wrong in relation to the smart contract that needs to be handled with a bespoke transaction, it is important that the owner knows how to build and run transactions and scripts safely to address the issues and/or upgrade the smart contracts.

The project should also have a clear plan of succession in case the original owner is not available or leaves the project. It is important that there are others who can fill in who have a clear understanding of the code and requirements so they can give good feedback, perform effective reviews, and make changes where needed.

### Projects should maintain a well-organized open source repository for their smart contracts

As projects like NBA Topshot have shown, when a blockchain product becomes successful others can and will build on top of what you are doing. Whether that is analytics, tools, or other value adds that could help grow your project ecosystem, composability is key and that depends on open source development. If there isn't already an open source repo, builders should strongly consider creating one.

Builders can start by initializing their projects with [Flow CLI] and the `flow init` command. and make sure all of their repo is set up with some initial documentation for what the repo is for before any code is written. External developers and users should have an easily accessible home page to go to to understand any given project.

The repo should also have some sort of high-level design document that lays out the intended design and architecture of the smart contract. The project leads should determine what is best for them to include in the document, but some useful things to include are basic user stories, the architecture of the smart contracts, and any questions that still need to be answered about it.

- Where applicable, diagrams should be made describing state machines, user flows, and so on.
- This document should be shared as an issue in the open source repo where the contracts or features are being developed, then later moved to the README or another important docs page.

A high-level design is a key opportunity to model threats and understand the risks of the system. The process of collaborating and reviewing designs together helps ensure that more edge-cases are captured and addressed. It's also a lot less effort to iterate on a design than on hundreds of lines of Cadence.

## Development process recommendations

### The development process should be iterative, if possible

The project should develop an MVP first, get reviews, and test thoroughly, then add additional features with tests. This ensures that the core features are designed thoughtfully and makes the review process easier because they can focus on each feature one at a time instead of being overwhelmed by a huge block of code.

### Comments and field/function descriptions are essential!

Our experience writing many Cadence smart contracts has taught us how important documentation is. It especially matters what is documented and for whom, and in that way we are no different from any software language. The _Why_ is super important, if for example something — such as an event — that happens in one contract leads to outcomes in a different contract. The _What_ helps give context, the reason for the code turning out the way it is. The _How_ you don't document — you've written the code. Comments should be directed to those who will follow after you when changing the code.

Comments should be written at the same time (or even before) the code is written. This helps the developer and reviewers understand the work-in-progress code better, as well as the intentions of the design (for testing and reviewing). Functions should be commented with the following:

- Description
- Parameter descriptions
- Return value descriptions

Top Level comments and comments for types, fields, events, and functions should use `///` (three slashes) to be recognised by the [Cadence Documentation Generator]. Regular comments within functions should only use two slashes (`//`)

## Testing recommendations

Summarized below is a list of testing related recommendations, which are noteworthy to mention for a typical smart contract project.

Popular testing frameworks to use for cadence are listed here:

- Cadence: [Cadence Testing Framework]
- JavaScript: [Flow JS Testing]
- Go: [Overflow]

The same person who writes the code should also write the tests. They have the clearest understanding of the code paths and edge cases.

Tests should be **mandatory**, not optional, even if the contract is copied from somewhere else. This should be thorough emulator unit tests in the public repo. [See the flow fungible token repo] for an example of unit tests in Cadence.

Every time there is a new Cadence version or emulator version, the dependencies of the repo should be updated to make sure the tests are all still passing.

Tests should avoid being monolithic; individual test cases should be set up for each part of the contract to test them in isolation. See the[`FlowEpoch` smart contract tests] for examples written in Go where test cases are split into separate blocks for different features. There are some exceptions, like contracts that have to run through a state machine to test different cases. Positive and negative cases need to be tested.

Integration tests should also be written to ensure that your app and/or backend can interact properly with the smart contracts.

## Managing project keys and deployments

Smart contract keys and deployments are very important and need to be treated as such.

### Private keys should be stored securely

Private Keys for the contract and/or admin accounts should not be kept in plain text format anywhere. Projects should determine a secure solution that works best for them to store their private keys. We recommend storing them in a secure key store such as Google KMS or something similar.

### Deployments to Testnet or Mainnet should be handled transparently

As projects become more successful, communities around them grow. In a trustless ecosystem, that also means more of others building on your contracts. Before deploying or upgrading a contract, it is important to maintain clear community communications with sufficient notice, since changes will always bring added risk. Giving community members time to review and address issues with upgrades before they happen builds trust and confidence in projects.

The following sections include a few suggestions for how to manage a deployment or upgrade.

**Communicate to all stake-holders well in advance**

Share the proposal with the community at least a week in advance (unless it is a critical bug fix)

- Examples of places to share are your project's chat, forum, blog, email list, and so on.
- This will allow the community and other stakeholders to have plenty of time to view the upcoming changes and provide feedback if necessary.
- Share the time of the deployment and the deployment transaction with branch/commit hash information to ensure the transaction itself is correct.
- Coordinate deployment with stakeholders to make sure it is done correctly and on time.

## Responsibilities to the community

Web3 brings tremendous possibilities for engineering applications with trustlessness and composability in mind, with Cadence and Flow offering unique features to achieve this. If every project treats their community and the Flow community with respect and care, the things we can all build together will be very powerful.

### Projects should have thorough documentation

Encouraging adoption of project contracts to the broader ecosystem raises the bar around code providing clear high-level descriptions, with detailed and useful comments within contracts, transactions, and scripts. The more that a project can be understood, that it adheres to standards, and can be built upon with ease, the more likely others will build against it in turn.

Each project should have a detailed `README.md` with these sections:
    
- Explanation of the project itself with links to the app.
- Addresses on various networks.
- High-level technical description of the contracts with emphasis on important types and functionality.
- Architecture diagram (if applicable).
- Include links to tutorials if they are external.
- Flow smart contract standards that a project implements.

Additionally, each contract, transaction, and script should have high-level descriptions at the top of their files. This way, anyone in the community can easily come in and understand what each one is doing without having to parse confusing code.

### Projects should engage with and respond to their own Community

Once a contract is deployed, the work doesn't stop there. Project communities require ongoing nurturing and support. As the developer of a public project on a public blockchain, the owners have an obligation to be helpful and responsive to the community so that they can encourage composability and third-party interactions.

- Keep issues open in the repo.
- The owner should turn on email notifications for new issue creation in the repo.
- Respond to issues quickly and clean up unimportant ones.
- Consider blog posts to share more details on the technical aspects of the project and upcoming changes.

### Projects should contribute to the greater Flow and Cadence community

Flow has a vibrant and growing community of contributors around the world. Through our mutual collaboration, we've had numerous community Flow Improvement Proposals ([FLIP]s) shipped. If you have an interest in a particular improvement for Flow or Cadence, we host open meetings that you are welcome to join (announced on Discord) and can participate anytime on any of the FLIPs as [already proposed].

Responsible project maintainers should contribute to discussions about important proposals (new cadence features, standard smart contracts, metadata, and so on) and generally be aware of evolving best practices and anti-pattern understandings. Projects that contribute to these discussions are able to influence them to ensure that the language/protocol changes are favorable to them and the rest of the app developers in the ecosystem. It also helps the owner to promote the project and themselves.

Resources for best practices:

- [Design Patterns]
- [Anti-Patterns]
- [Security Best Practices]

Composability and extensibility should also be prioritized while designing, developing, and documenting their projects (documentation for these topics coming soon).

If you have any feedback about these guidelines, please create an issue in the `cadence-lang.org` repo or make a PR updating the guidelines so we can start a discussion.

<!-- Relative links. Will not render on the page -->

[FungibleToken]: https://github.com/onflow/flow-ft
[NFT StoreFront]: https://github.com/onflow/nft-storefront
[here]: ./index.md
[Cadence Documentation Generator]: https://github.com/onflow/cadence-tools/tree/master/docgen
[Cadence Testing Framework]: ./testing-framework.mdx
[Flow CLI]: https://developers.flow.com/build/tools/flow-cli
[Flow JS Testing]: ./testing-framework.mdx
[Overflow]: https://github.com/bjartek/overflow
[See the flow fungible token repo]: https://github.com/onflow/flow-ft/tree/master/tests
[`FlowEpoch` smart contract tests]: https://github.com/onflow/flow-core-contracts/blob/master/lib/go/test/flow_epoch_test.go
[FLIP]: https://github.com/onflow/flow/tree/master/flips
[already proposed]: https://github.com/onflow/flow/pulls?q=is%3Aopen+is%3Apr+label%3AFLIP
[Design Patterns]: ./design-patterns.md
[Anti-Patterns]: ./anti-patterns.md
[Security Best Practices]: ./security-best-practices.md