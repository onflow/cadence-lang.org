---
title: Cadence 1.0 Migration Guide
sidebar_position: 1
sidebar_label: Cadence 1.0 Migration Guide
---

On September 4th, 2024, the Flow Mainnet upgraded to Cadence 1.0.

This migration guide offers developers guidance and actionable steps for updating projects to be compatible with Cadence 1.0.

The Cadence 1.0 release, introduced in the [Crescendo] network upgrade, is a breaking change. Developers need to make sure all Cadence code used by their apps (transactions and scripts) is updated to Cadence 1.0, to ensure it continues to work after the network upgrade.

Many of the improvements of Cadence 1.0 fundamentally change how Cadence works and is used. This means it is necessary to break existing code to release this version, which will guarantee stability going forward.

## Benefits of Cadence 1.0

Cadence 1.0 is the latest version of the Cadence smart contract programming language. The stable release of Cadence 1.0 represents a significant milestone in the language's maturity, delivering a [comprehensive suite of new features and improvements] that provide new possibilities, increase speed, security, and efficiency. With Cadence 1.0, developers gain access to over 20 new features and enhancements. Each change is thoughtfully designed to streamline workflows, reduce duplication, and improve code readability, making writing and understanding smart contracts much easier.

## Upgrading NFT and FT contracts

In addition to changes to the Cadence programming language, the Cadence token standards were also streamlined and improved. Existing Cadence scripts and transactions interacting with NFTs and FTs must be updated. If you do _not_ update your code, your applications will become non-functional.

- [Guide for NFT Standard v2]
- [Guide for FT Standard v2]
- [Cadence 1.0 Improvements & New Features]

<!-- Relative links. Will not render on the page -->

[Crescendo]: https://flow.com/upgrade/crescendo
[comprehensive suite of new features and improvements]: ./improvements.md
[Guide for NFT Standard v2]: ./nft-guide.mdx
[Guide for FT Standard v2]: ./ft-guide.mdx
[Cadence 1.0 Improvements & New Features]: ./improvements.md
