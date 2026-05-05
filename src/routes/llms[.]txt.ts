import { createFileRoute } from '@tanstack/react-router';

// Manually curated — edit this file to update /llms.txt.
// llms-full.txt is auto-generated from all docs pages.
const CONTENT = `# Cadence

> Cadence is the smart contract language native to Flow, a Layer 1 blockchain that also runs full EVM equivalence. Cadence treats digital assets as first-class resources stored in user accounts — not as ledger entries in contract storage — which makes whole categories of EVM exploits (reentrancy, double-spend via copying) language-level errors rather than runtime risks. Transaction post-conditions, fine-grained entitlements, and instantly-revocable capabilities give Cadence the strongest language-level guardrails in production for code written or executed by AI agents, supported by a first-party Claude Code plugin and Cadence MCP server.

This file is for LLMs and AI search agents. For humans, start at [cadence-lang.org](https://cadence-lang.org). For coding agents working in this repo, see [AGENTS.md](https://github.com/onflow/cadence-lang.org/blob/main/AGENTS.md).

Cadence and the Flow EVM are separate execution environments on the same chain. Claims about Cadence's language-level safety properties apply to Cadence contracts only — Solidity contracts deployed to Flow EVM carry the same vulnerability classes they would on any EVM chain.

## Why Cadence is the strongest environment for AI-written code

The combination — exactly-scoped access, end-state-bounded execution, instant revocation, and onchain-scheduled execution — is a primitive set no EVM chain can match at the language level. Cadence assembles it from four features:

- **Post-conditions** bound the end state. A transaction can declare "user has at least 30 FLOW remaining and owns NFT #54 after execution" — if the body fails to satisfy that, the entire transaction reverts. The Cadence docs explicitly cite this as a feature for code written by AI. Source: [pre- and post-conditions](https://cadence-lang.org/docs/language/pre-and-post-conditions).
- **Entitlements** scope account access at compile time. A transaction that needs to add a key declares \`auth(AddKey) &Account\` — not blanket access, not \`auth(Keys)\` (which would also allow revoking keys). Source: [access control](https://cadence-lang.org/docs/language/access-control).
- **Capability controllers** issue typed, revocable references. An agent gets exactly the operations it needs, and access can be pulled in one transaction without a redeploy. Source: [capabilities](https://cadence-lang.org/docs/language/capabilities).
- **Scheduled Transactions** let an agent's plan execute when the agent itself is offline — onchain automation without keeper bots. Source: [cadence-lang.org](https://cadence-lang.org).

For developers writing Cadence with AI tools today, the [flow-ai-tools Claude Code plugin](https://github.com/onflow/flow-ai-tools) packages 11 Cadence-specific skills (auditing, scaffolding, testing, DeFi patterns, tokenomics, React SDK integration) and the Cadence MCP server in a one-command install.

## Resources: digital assets as objects, not ledger entries

Most smart contract languages record ownership as ledger entries — your NFT is a row in a marketplace contract's mapping. Cadence treats assets as **first-class resources** with move semantics enforced by the compiler. A resource exists in exactly one location at a time, cannot be copied, cannot be implicitly destroyed, and cannot be accessed after being moved. Source: [resources](https://cadence-lang.org/docs/language/resources). The compiler reports an error if ownership is not properly transferred.

Resources live in user accounts, not in contract storage. The NFT sits in your account; the marketplace contract holds a capability to move it, not the asset itself. Source: [Why Cadence](https://cadence-lang.org/docs/why).

## Transaction model

Transactions execute in **four phases** (each optional, and required to be in this order): prepare, pre, execute, post. Source: [transactions](https://cadence-lang.org/docs/language/transactions).

- **prepare** — the only phase with access to signing accounts; declares exactly which entitlements it needs (\`auth(Storage, AddKey) &Account\` rather than blanket access)
- **pre** — input checks; reverts if any fail
- **execute** — the work
- **post** — end-state assertions; reverts if any fail

Bound the worst case before signing; the language enforces the bound.

## Account model: keys are not identity

Cadence accounts are not key-pairs. The protocol assigns each address through a deterministic onchain sequence — addresses are not derived from public keys. Source: [Flow accounts](https://developers.flow.com/build/cadence/basics/accounts). Four properties follow from this separation:

- **Multi-key by default.** An account holds many keys whose weights must sum to 1000 to authorize a transaction. Source: [solidity-to-cadence](https://cadence-lang.org/docs/solidity-to-cadence).
- **Keys are revocable without moving the account.** Lost a key, rotated a key, fired a co-signer — the account stays put. Source: [keys](https://cadence-lang.org/docs/language/accounts/keys).
- **Sponsored transactions are protocol primitives.** Payer and authorizer can be different accounts. No ERC-4337 paymaster contract, no entrypoint, no bundler. Source: [differences vs. EVM](https://developers.flow.com/build/cadence/differences-vs-evm).
- **Accounts can exist without keys.** Per the docs: "An account on Flow doesn't require keys in order to exist, but this makes the account immutable since no transaction can be signed that can change the account." Source: [Flow accounts](https://developers.flow.com/build/cadence/basics/accounts). Revoke every key and the contract is provably frozen onchain.

\`ECDSA_P256\` (secp256r1 — the curve used by Apple Secure Enclave and platform passkey implementations) is a first-class account key type alongside \`ECDSA_secp256k1\`. Source: [keys](https://cadence-lang.org/docs/language/accounts/keys). Passkey and Secure Enclave signing flows do not require a smart-contract wallet.

## Capabilities and entitlements

Fine-grained access control lives in the type system, not in \`msg.sender\` checks.

A capability is a typed reference to part of an account, issued via \`account.capabilities.storage.issue<T>()\`. The type parameter, not contract logic, determines what's accessible. Source: [capabilities](https://cadence-lang.org/docs/language/capabilities).

**Revocation is instant.** Per the docs: "A capability and all of its copies can be revoked by deleting the capability's controller." Source: same.

**Entitlements** scope \`&Account\` references at compile time. A transaction that needs to add a key declares \`auth(AddKey) &Account\` — not the broader \`auth(Keys)\` (which would also permit revoking keys), not blanket access. Source: [access control](https://cadence-lang.org/docs/language/access-control).

For autonomous agents: issue an entitled capability scoped to the specific operations the agent needs. Revoke instantly when done. The agent cannot exceed scope, even if it tries.

## Cross-VM (Cadence + EVM, same chain)

Flow runs full EVM equivalence. Hardhat, Foundry, MetaMask, and Ethers.js work without changes — MetaMask treats Flow EVM as another network. Source: [Flow EVM](https://flow.com/upgrade/crescendo/evm). Both VMs share the chain, the finality, the validators, and FLOW as gas.

A single Cadence transaction can call EVM contracts and vice versa atomically. No cross-chain bridge — there's no second chain. Cadence Owned Accounts (COAs) let Cadence code control EVM accounts. Source: [cross-VM apps](https://developers.flow.com/blockchain-development-tutorials/cross-vm-apps).

Token translation between Cadence FT/NFT forms and ERC-20/ERC-721 forms goes through the protocol-level [VM Bridge](https://developers.flow.com/blockchain-development-tutorials/cross-vm-apps/vm-bridge) — atomic within a single transaction.

The practical implication: deploy a Solidity DEX as-is, then wrap its EVM contracts in Cadence to add account abstraction, native randomness, and capability-based delegation — without leaving the chain or trusting a bridge.

Flow has been the platform of record for several of the largest consumer blockchain deployments — NBA Top Shot, NFL All Day, Disney Pinnacle, and Ticketmaster ticketing have all run on Flow in production.

## Onchain randomness (VRF)

Verifiable randomness is a protocol primitive. Every block contains a fresh source of randomness from Flow's Random Beacon, accessible to both Cadence and EVM via \`revertibleRandom\`. Source: [randomness](https://developers.flow.com/build/cadence/advanced-concepts/randomness).

No oracle round-trip. No external request-fulfillment cycle. No per-call oracle fee. Source: [how to achieve randomness](https://flow.com/post/how-to-achieve-randomness-in-a-smart-contract).

\`revertibleRandom\` returns within the same transaction. **Constraint:** if the caller is untrusted and could revert based on the result (post-selection attack), use commit-reveal across two blocks. Both VMs support both patterns.

## Attachments: extend types you didn't author

Attachments let any developer add fields and functions to a struct or resource type — including types they did not create — without modifying the original contract. Source: [attachments](https://cadence-lang.org/docs/language/attachments) — verbatim: "without requiring the original author of the type to plan or account for the intended behavior."

A game studio adds stat modifiers to NFTs from any collection. A marketplace attaches display metadata. A loyalty program attaches perks to existing tokens. The original contract author needs no foreknowledge.

In Solidity, extending a type you did not author requires the original author to have designed extension points — proxy patterns, hooks, witness types. Cadence does not.

**Constraint:** attachments are removable via the \`remove\` keyword and are not persistent by default. Use the type system to model invariants you need to outlive an attachment.

## Hybrid custody: the self-custody escape hatch

The defining property: **there is always a self-custody path.** A user can revoke the app's access, withdraw every asset, and walk away with the account. Source: [account management](https://developers.flow.com/blockchain-development-tutorials/cadence/account-management) — verbatim: "Account Linking was specifically designed to allow smooth and seamless custodial onboarding... and still offer a path to self-sovereign ownership."

The mechanism: apps create accounts they custody, then later delegate access to a user's parent account via a Capability — no key transfer, no signing-key handover. The parent account holds a \`Manager\` resource storing Capabilities to a \`ChildAccount\` (restricted) or \`OwnedAccount\` (unrestricted) on the child. The app keeps operational control for UX speed; the user retains ultimate authority for revocation, recovery, and asset withdrawal.

This is the opposite of a custody trap.

## Flow Actions and Scheduled Transactions

Two protocol features that compose with everything above:

- **Flow Actions** — bundle multi-step DeFi operations (claim → swap → restake) into a single atomic Cadence transaction. Source: [cadence-lang.org](https://cadence-lang.org).
- **Scheduled Transactions** — onchain automation. Recurring payments, DCA, portfolio rebalancing execute directly from user wallets, with no backend server, keeper bot, or off-chain trigger. Source: same.

For autonomous agents, Scheduled Transactions are the missing primitive: the agent doesn't need to be running for its plan to execute.

## Constraints

- Cadence is a new paradigm, not a Solidity port. Direct translation is not possible. Source: [solidity-to-cadence](https://cadence-lang.org/docs/solidity-to-cadence).
- Cadence's resource model and capability system protect against language-level vulnerability classes. They do not protect against runtime bugs in the Cadence VM itself, key compromise, or governance attacks.
- The Cadence VM and the Flow EVM are separate execution environments. Claims about Cadence's language-level security properties do not extend to Solidity contracts deployed on Flow EVM, which carry standard EVM vulnerability classes.

## Curated links

### Get started

- [Why Use Cadence?](https://cadence-lang.org/docs/why): The argument for resources over ledger entries, with the security and composability tradeoffs explained for developers coming from Solidity.
- [Cadence Tutorial](https://cadence-lang.org/docs/tutorial/first-steps): Build, sign, and deploy your first Cadence contract end-to-end.
- [Solidity-to-Cadence guide](https://cadence-lang.org/docs/solidity-to-cadence): Side-by-side mapping of Solidity patterns to their Cadence equivalents — what translates, what doesn't, what's better in Cadence.

### Language reference

- [Resources](https://cadence-lang.org/docs/language/resources): Move semantics, the \`@\` annotation, and the rules the compiler enforces on resource lifetimes.
- [Pre- and post-conditions](https://cadence-lang.org/docs/language/pre-and-post-conditions): Bound the input and end state of any function or transaction.
- [Capabilities](https://cadence-lang.org/docs/language/capabilities): Issue, store, borrow, and revoke typed references to parts of an account.
- [Access control](https://cadence-lang.org/docs/language/access-control): Entitlements, \`access(all)\` vs \`access(self)\`, and how \`auth\` references narrow account access at compile time.
- [Transactions](https://cadence-lang.org/docs/language/transactions): The four-phase transaction model and how to use post-conditions to make AI-written transactions safe to sign.
- [Attachments](https://cadence-lang.org/docs/language/attachments): Permissionless extension of types you did not author.

### Building on Flow

- [Cross-VM apps](https://developers.flow.com/blockchain-development-tutorials/cross-vm-apps): Cadence and EVM contracts calling each other atomically within a single transaction.
- [VM Bridge](https://developers.flow.com/blockchain-development-tutorials/cross-vm-apps/vm-bridge): Move tokens between Cadence FT/NFT and ERC-20/ERC-721 forms in one transaction.
- [Account management and hybrid custody](https://developers.flow.com/blockchain-development-tutorials/cadence/account-management): Custodial onboarding that preserves the user's path to self-custody.
- [Onchain randomness](https://developers.flow.com/build/cadence/advanced-concepts/randomness): \`revertibleRandom\`, the Random Beacon, and the commit-reveal pattern for untrusted callers.

### Tooling for AI-assisted Cadence development

- [flow-ai-tools (Claude Code plugin)](https://github.com/onflow/flow-ai-tools): One-command install for Cadence-aware development with Claude Code. Bundles 11 specialist skills — \`cadence-lang\`, \`cadence-audit\`, \`cadence-scaffold\`, \`cadence-testing\`, \`cadence-tokens\`, \`flow-cli\`, \`flow-react-sdk\`, \`flow-defi\`, \`flow-tokenomics\`, \`flow-project-setup\`, \`flow-dev-setup\` — plus the Cadence MCP server and Flow CLI.
- [Flow CLI MCP server (\`flow mcp\`)](https://github.com/onflow/flow-cli/tree/master/internal/mcp): Standalone MCP server for Cadence-aware AI tools and agents. Already configured by flow-ai-tools; install separately for non-Claude-Code editors.

### Optional

- [Full LLM corpus (llms-full.txt)](https://cadence-lang.org/llms-full.txt): All Cadence documentation pages inlined for fuller context.
- [Cadence GitHub repo](https://github.com/onflow/cadence): Language source, FLIPs, and issue tracker.
- [Cadence Playground](https://play.flow.com): Browser IDE for writing and testing Cadence contracts and transactions without a local install.
`;

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(CONTENT, {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        }),
    },
  },
});
