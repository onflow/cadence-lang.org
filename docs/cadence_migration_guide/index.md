---
title: Cadence 1.0 Migration Guide
sidebar_position: 1
sidebar_label: Cadence 1.0 Migration Guide
---

# Cadence 1.0 Migration Guide

Coming in 2024, the network will be upgrading to [Cadence 1.0](https://flow.com/upgrade/cadence-1). This means that all applications will need to prepare and migrate their existing Cadence smart contracts, scripts, and transactions for compatibility with the update. If you do not update your contracts, your applications will become non-functional after the network upgrade. Read more about the roadmap [here](https://flow.com/upgrade/cadence-1).

### Upgrading Contracts

To ensure your contracts are fully operational with Cadence 1.0, follow these essential steps:

1. **Understand the Changes:** Start by familiarizing yourself with the [changes](https://forum.flow.com/t/update-on-cadence-1-0/5197) to identify how they might affect your code.
2. **Modify Your Code:** Update your contracts, transactions, and scripts in accordance with the new changes.
3. **Test Your Code:** The latest emulator [release](https://github.com/onflow/flow-cli/releases/tag/v1.12.0-cadence-v1.0.0-M4-2) includes all updated standards and core contracts. Check out this [video](https://www.loom.com/share/4467610b7beb4ebbaabed6b430dc25c4?sid=14ecb3e7-e933-409c-a6a4-add40c6971d0) from the Flow team on how to install and use the Cadence 1.0 emulator. The code can be accessed with:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Linux/macOS

```bash

sudo sh -ci "$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)" -- v1.12.0-cadence-v1.0.0-M4-2

```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Windows (in PowerShell):

```

iex "& { $(irm 'https://raw.githubusercontent.com/onflow/flow-cli/master/install.ps1') } v1.12.0-cadence-v1.0.0-M4-2"
```

4. **Stage**: A new **_Staging process_** will be released in the coming weeks that checks if your updated code is compatible with Cadence 1.0. Complete this [form](https://docs.google.com/forms/d/e/1FAIpQLSfprZJLPSEAS6H7_oL0j6bzetDzkHPmDZHYAGgqAAOAdLDKqw/viewform) to stay informed about updates and receive recommendations tailored to your code.

### Resources

**Guides & Docs**

For assistance with the most common updates developers will face, explore these resources:

- Cadence 1.0 [Beginner Course](https://academy.ecdao.org/en/catalog/courses/learn-cadence-beginner-1.0)
- Upgrading [Capabilities](https://academy.ecdao.org/en/catalog/tutorials/capability-controllers)
- Upgrading [Entitlements](https://academy.ecdao.org/en/catalog/tutorials/entitlements)
- Migration Guide for [Fungible Tokens](./ft-guide.mdx)
- Migration Guide for [NFTs](./nft-guide.mdx)
- Migration Guide for [Core Contracts](./core-contracts-guide.mdx)
- Migration Guide for [Type Annotations](./type-annotations-guide.mdx)

**Helper Tools**

- **Cadence 1.0 Migration Helper CustomGPT:** An experimental tool currently exclusive to ChatGPT Pro users. [Try it here](https://chat.openai.com/g/g-wMnnHS2Md-flow-cadence-1-0-migration-helper).

**In-Person Support**

- Attend the weekly live [Cadence 1.0 Developer Office hours](https://calendar.google.com/calendar/ical/c_47978f5cd9da636cadc6b8473102b5092c1a865dd010558393ecb7f9fd0c9ad0%40group.calendar.google.com/public/basic.ics) happening every Thursday to ask questions you’re stuck on
- Shoot a message in the [developer Discord](https://discord.com/channels/613813861610684416/621847426201944074) channel. Please use “C1.0 upgrade” at the beginning of the message to help us categorize questions related to Cadence 1.0
- Send us a request in the Developer [Help Center](https://support.flow.com/hc/en-us/requests/new)

### Dive Deeper

Enhance your understanding of the network upgrade and its possible implications on your app:

- [Learn how Cadence will be changing for 1.0](https://forum.flow.com/t/update-on-cadence-1-0/5197)
- [Understand the upgrade, the timeline, and how it affects you](https://forum.flow.com/t/cadence-1-0-upgrade-plan/5477)
- [Learn how to update your Flow CLI to test against Cadence 1.0](https://forum.flow.com/t/update-on-cadence-1-0/5197/7)
- [Check out the Cadence language 1.0 docs](https://cadencelang.dev/docs/1.0/)
- [Learn about Contract Staging](https://forum.flow.com/t/updates-to-cadence-1-0-contract-staging/5642)
