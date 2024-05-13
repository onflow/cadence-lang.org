# Migration Environments

## What is a Migration Environment?

To facilitate a seamless migration to Crescendo, all contracts must be updated to Cadence 1.0 and staged. During the upgrade, staged code replaces the currently deployed live contracts. Migration Environments are temporary forked networks designed to ensure a smooth transition. These environments allow for the migration and testing of on chain data (state) as well as staged contracts to simulate the upcoming upgrade. Weekly reports on the results of the migration detail which contracts have passed or failed along with helpful error messages can include recommendations on what needs to be fixed.

## When Does the Migration Occur?

The Migration Environment for Testnet launched in April and is currently active. It will transition to a Migration Environment for Mainnet on May 22nd.

The Testnet Migration Environment operates every Thursday. Upon completion of the migration, a report is generated and shared with the community. Regular review of these reports is crucial as community-proposed language changes, if implemented, could introduce breaking changes requiring re-staging of contracts.

## How to Access Reports

Access all weekly migration reports through this [repository](https://github.com/onflow/cadence/tree/master/migrations_data).

## Accessing the Migration Environment

The Migration Environment is useful for developers to test their updated transactions against to verify that they will work as expected with Crescendo. To live-test during its operation from Wednesday to Thursday, connect to the Testnet Migration Environment using this endpoint:

```
access-001.migrationtestnet1.nodes.onflow.org:9000 
```
