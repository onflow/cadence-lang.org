// Cadence snippets shown on the homepage.
// Consumed by the page and by plugins/cadence-highlight at build time,
// so both always highlight exactly what is rendered.

const nftSnippet = `// The system enforces ownership
access(all) resource NFT {
    access(all) let id: UInt64
    init() { self.id = self.uuid }
}

// A receiver owns the slot the resource moves into
access(all) resource Collection {
    access(all) var stored: @NFT?
    init() { self.stored <- nil }

    access(all) fun deposit(token: @NFT) {
        self.stored <-! token
    }
}

// Moves are explicit and safe
access(all) fun transfer(token: @NFT, receiver: &Collection) {
    // '@' denotes a resource that MUST be handled
    receiver.deposit(token: <- token)
}`;

const defiSnippet = `import "DeFiActions"
import "FlowToken"
import "IncrementFiStakingConnectors"
import "IncrementFiPoolLiquidityConnectors"
import "SwapConnectors"

// Schedule daily yield compounding with Flow Actions
transaction(stakingPoolId: UInt64, executionEffort: UInt64) {
    prepare(signer: auth(Storage, Capabilities) &Account) {

        // Compose DeFi actions atomically: Claim → Zap → Restake
        let operationID = DeFiActions.createUniqueIdentifier()
        
        // Source: Claim staking rewards
        let rewardsSource = IncrementFiStakingConnectors.PoolRewardsSource(
            userCertificate: signer.capabilities.storage
                .issue<&StakingPool>(/storage/userCertificate),
            pid: stakingPoolId,
            uniqueID: operationID
        )
        
        // Swapper: Convert single reward token → LP tokens
        let zapper = IncrementFiPoolLiquidityConnectors.Zapper(
            token0Type: Type<@FlowToken.Vault>(),
            token1Type: Type<@RewardToken.Vault>(),
            stableMode: false,
            uniqueID: operationID
        )
        
        // Compose: Wrap rewards source with zapper
        let lpSource = SwapConnectors.SwapSource(
            swapper: zapper,
            source: rewardsSource,
            uniqueID: operationID
        )
        
        // Sink: Restake LP tokens back into pool
        let poolSink = IncrementFiStakingConnectors.PoolSink(
            pid: stakingPoolId,
            staker: signer.address,
            uniqueID: operationID
        )
    }
}`;

module.exports = { nftSnippet, defiSnippet };
