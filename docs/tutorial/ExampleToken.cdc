/// ExampleToken.cdc
///
/// The ExampleToken contract is a sample implementation of a fungible token on Flow.
///
/// Fungible tokens behave like everyday currencies -- they can be minted, transferred or
/// traded for digital goods.
///
/// This is a basic implementation of a Fungible Token and is NOT meant to be used in production
/// See the Flow Fungible Token standard for real examples: https://github.com/onflow/flow-ft

access(all) contract ExampleToken {

    access(all) entitlement Withdraw

    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath

    access(all) var totalSupply: UFix64

    /// Balance
    ///
    /// The interface that provides a standard field
    /// for representing balance
    ///
    access(all) resource interface Balance {
        access(all) var balance: UFix64
    }

    /// Provider
    ///
    /// The interface that enforces the requirements for withdrawing
    /// tokens from the implementing type.
    ///
    /// It does not enforce requirements on `balance` here,
    /// because it leaves open the possibility of creating custom providers
    /// that do not necessarily need their own balance.
    ///
    access(all) resource interface Provider {

        /// withdraw subtracts tokens from the implementing resource
        /// and returns a Vault with the removed tokens.
        ///
        /// The function's access level is `access(Withdraw)`
        /// So in order to access it, one would either need the object itself
        /// or an entitled reference with `Withdraw`.
        ///
        /// @param amount the amount of tokens to withdraw from the resource
        /// @return The Vault with the withdrawn tokens
        ///
        access(Withdraw) fun withdraw(amount: UFix64): @Vault {
            post {
                // `result` refers to the return value
                result.balance == amount:
                    "ExampleToken.Provider.withdraw: Cannot withdraw tokens!"
                    .concat("The balance of the withdrawn tokens (").concat(result.balance.toString())
                    .concat(") is not equal to the amount requested to be withdrawn (")
                    .concat(amount.toString()).concat(")")
            }
        }
    }

    /// Receiver
    ///
    /// The interface that enforces the requirements for depositing
    /// tokens into the implementing type.
    ///
    /// We do not include a condition that checks the balance because
    /// we want to give users the ability to make custom receivers that
    /// can do custom things with the tokens, like split them up and
    /// send them to different places.
    ///
    access(all) resource interface Receiver {

        /// deposit takes a Vault and deposits it into the implementing resource type
        ///
        /// @param from the Vault that contains the tokens to deposit
        ///
        access(all) fun deposit(from: @Vault)
    }

    /// Vault
    ///
    /// Each user stores an instance of only the Vault in their storage
    /// The functions in the Vault are governed by the pre and post conditions
    /// in the interfaces when they are called.
    /// The checks happen at runtime whenever a function is called.
    ///
    /// Resources can only be created in the context of the contract that they
    /// are defined in, so there is no way for a malicious user to create Vaults
    /// out of thin air. A special Minter resource or constructor function needs to be defined to mint
    /// new tokens.
    ///
    access(all) resource Vault: Balance, Provider, Receiver {

		/// keeps track of the total balance of the account's tokens
        access(all) var balance: UFix64

        /// initialize the balance at resource creation time
        init(balance: UFix64) {
            self.balance = balance
        }

        /// withdraw
        ///
        /// Function that takes an integer amount as an argument
        /// and withdraws that amount from the Vault.
        ///
        /// It creates a new temporary Vault that is used to hold
        /// the money that is being transferred. It returns the newly
        /// created Vault to the context that called so it can be deposited
        /// elsewhere.
        ///
        access(Withdraw) fun withdraw(amount: UFix64): @Vault {
            pre {
                self.balance >= amount:
                    "ExampleToken.Vault.withdraw: Cannot withdraw tokens! "
                    .concat("The amount requested to be withdrawn (").concat(amount.toString())
                    .concat(") is greater than the balance of the Vault (")
                    .concat(self.balance.toString()).concat(").")
            }
            self.balance = self.balance - amount
            return <-create Vault(balance: amount)
        }

        /// deposit
        ///
        /// Function that takes a Vault object as an argument and adds
        /// its balance to the balance of the owners Vault.
        ///
        /// It is allowed to destroy the sent Vault because the Vault
        /// was a temporary holder of the tokens. The Vault's balance has
        /// been consumed and therefore can be destroyed.
        access(all) fun deposit(from: @Vault) {
            self.balance = self.balance + from.balance
            destroy from
        }
    }

    /// createEmptyVault
    ///
    access(all) fun createEmptyVault(): @Vault {
        return <-create Vault(balance: 0.0)
    }

	// VaultMinter
    //
    // Resource object that an admin can control to mint new tokens
    access(all) resource VaultMinter {

		// Function that mints new tokens and deposits into an account's vault
		// using their `{Receiver}` reference.
        // We say `&{Receiver}` to say that the recipient can be any resource
        // as long as it implements the Receiver interface
        access(all) fun mintTokens(amount: UFix64, recipient: Capability<&{Receiver}>) {
            let recipientRef = recipient.borrow()
            ?? panic("ExampleToken.VaultMinter.mintTokens: Could not borrow a receiver reference to "
                     .concat("the specified recipient's ExampleToken.Vault")
                     .concat(". Make sure the account has set up its account ")
                     .concat("with an ExampleToken Vault and valid capability."))

            ExampleToken.totalSupply = ExampleToken.totalSupply + UFix64(amount)
            recipientRef.deposit(from: <-create Vault(balance: amount))
        }
    }

    /// The init function for the contract. All fields in the contract must
    /// be initialized at deployment. This is just an example of what
    /// an implementation could do in the init function. The numbers are arbitrary.
    init() {
        self.VaultStoragePath = /storage/CadenceFungibleTokenTutorialVault
        self.VaultPublicPath = /public/CadenceFungibleTokenTutorialReceiver

        self.totalSupply = 30.0

        // create the Vault with the initial balance and put it in storage
        // account.save saves an object to the specified `to` path
        // The path is a literal path that consists of a domain and identifier
        // The domain must be `storage`, `private`, or `public`
        // the identifier can be any name
        let vault <- create Vault(balance: self.totalSupply)
        self.account.storage.save(<-vault, to: self.VaultStoragePath)

        // Create a new VaultMinter resource and store it in account storage
        self.account.storage.save(<-create VaultMinter(), to: /storage/CadenceFungibleTokenTutorialMinter)

    }
}