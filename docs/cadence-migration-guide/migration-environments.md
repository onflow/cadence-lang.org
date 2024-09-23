# Migration Environments

## What is a Migration Environment?

To facilitate a seamless migration to Crescendo, all contracts must be updated to Cadence 1.0 and staged. During the upgrade, staged code replaces the currently deployed live contracts. Migration Environments are temporary forked networks designed to ensure a smooth transition. These environments allow for the migration and testing of on chain data (state) as well as staged contracts to simulate the upcoming upgrade. Weekly reports on the results of the migration detail which contracts have passed or failed along with helpful error messages can include recommendations on what needs to be fixed.

## When Does the Migration Occur?

The Migration Environment for Testnet launched in April and existed till the upgrade went live August 14th, 2024.

The Testnet Migration Environment currently operates every Monday. 

## How to Access Reports

Access all past weekly migration reports through this [repository](https://github.com/onflow/cadence/tree/master/migrations_data).

## Accessing the Mainnet Migration Environment

The Migration Environment can be useful for developers to test their updated transactions against to verify that they will work as expected after Crescendo. 

For security reasons, the Mainnet Migration Environment can only be accessed by whitelisted egress IPs, to request access kindly email ali.serag@flowfoundation.org and send an email with the following:
- The name and description of project you're requesting access for and link to relevant contracts.
- Share the egress IPs you would like whitelisted.
- What you plan to test.

We will get back to you as soon as possible!

Some important notes about the Mainnet Migration Environment:
1. The environment does not come with uptime gurantees as it is used for internal testing.
2. Does not have a REST endpoint configured.
3. Is not as performant as the real Mainnet, so please only consider it for limited testing - the majority of testing should be happening locally as well as on Testnet. 
