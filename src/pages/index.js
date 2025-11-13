import React, { useRef, useLayoutEffect, useState } from 'react';
import clsx from 'clsx';
import Head from 'next/head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import { HiArrowRight, HiArrowSmDown } from 'react-icons/hi';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Lottie from "lottie-react";
import securityAnimation from "./security.json";
import debuggingAnimation from "./debugging.json";
import composabilityAnimation from "./composability.json";
import powerAnimation from "./power.json";
import learnAnimation from "./learn.json";

import styles from './index.module.css';
import Logo from '@site/static/img/logo.svg';

const example = `import "DeFiActions"
import "FlowToken"
import "FlowTransactionScheduler"
import "FlowTransactionSchedulerUtils"
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

        // Setup transaction scheduler manager
        if signer.storage.borrow<&AnyResource>(
            from: FlowTransactionSchedulerUtils.managerStoragePath) == nil {
            let manager <- FlowTransactionSchedulerUtils.createManager()
            signer.storage.save(<-manager, to: FlowTransactionSchedulerUtils.managerStoragePath)
        }
        
        let manager = signer.storage.borrow<auth(FlowTransactionSchedulerUtils.Owner)
            &{FlowTransactionSchedulerUtils.Manager}>(
            from: FlowTransactionSchedulerUtils.managerStoragePath
        ) ?? panic("Could not borrow Manager")

        // Estimate and pay fees
        let estimate = FlowTransactionScheduler.estimate(
            data: nil,
            timestamp: nextExecution,
            priority: priority,
            executionEffort: executionEffort
        )
        
        let feeVault = signer.storage.borrow<auth(FungibleToken.Withdraw) 
            &FlowToken.Vault>(from: /storage/flowTokenVault)!
        let fees <- feeVault.withdraw(amount: estimate.flowFee ?? 0.0) as! @FlowToken.Vault
        
        // Get handler capability
        let handlerCap = signer.capabilities.storage
            .issue<auth(FlowTransactionScheduler.Execute) 
                &{FlowTransactionScheduler.TransactionHandler}>(/storage/RestakeHandler)
        
        // Schedule recurring execution
        manager.schedule(
            handlerCap: handlerCap,
            data: nil,
            timestamp: getCurrentBlock().timestamp + 86400.0, // 24 hours
            priority: FlowTransactionScheduler.Priority.Medium,
            executionEffort: executionEffort,
            fees: <-fees
        )
    }
}`

function cadence(Prism) {
  Prism.languages.cadence = {
    comment: {
      pattern: /\/\/.*/,
      greedy: true
    },
    string: {
      pattern: /"[^"]*"/,
      greedy: true
    },
    keyword:
      /\b(?:access|all|fun|resource|create|let|destroy|return|self|var|init|from|import|transaction|prepare|auth|Storage|Account|true|false)\b/,
    'class-name': /\b[A-Z][A-Za-z_\d]*\b/,
    function: /\b[a-z_]\w*(?=\s*\()/i,
    number: /\b\d+\.?\d*\b/,
  }
}

cadence.displayName = 'cadence'

SyntaxHighlighter.registerLanguage('cadence', cadence)

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>

        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const leftColumnRef = useRef(null);
  const [codeBoxHeight, setCodeBoxHeight] = useState(null);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (leftColumnRef.current) {
        // Use requestAnimationFrame to ensure layout is complete
        requestAnimationFrame(() => {
          if (leftColumnRef.current) {
            setCodeBoxHeight(leftColumnRef.current.offsetHeight);
          }
        });
      }
    };

    // Initial measurement
    updateHeight();
    
    // Also measure after a small delay to catch any async layout changes
    const timeoutId = setTimeout(updateHeight, 0);
    
    window.addEventListener('resize', updateHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <Layout
      title={`${siteConfig.title} - Build the Future of Consumer DeFi`}
      description="Ship Consumer DeFi products faster. Cadence delivers the security, automation, and tooling to build financial apps that millions trust.">
      <main>

      <div className="content-wrapper">
          <div className="feature" style={{ alignItems: 'flex-start' }}>
            <div ref={leftColumnRef} style={{ display: 'flex', flexDirection: 'column', flex: '0 0 auto' }}>
            <Head>
              <title>Cadence</title>
            </Head>
              <Logo title="Cadence" className="logo" width="18em" height="4em" />
              <h2>
                Build the future of Consumer DeFi.
                <br/>
                The safest, most <strong>composable</strong> language
                <br/>
                for <strong>financial applications</strong> that reach millions.
              </h2>

              <Link className="cta" href="/docs">
                Get started <HiArrowRight/>
              </Link>
              
              <div style={{ 
                position: 'relative', 
                paddingBottom: '56.25%', 
                height: 0, 
                overflow: 'hidden', 
                width: '100%', 
                marginTop: '2rem',
                flexShrink: 0,
                borderRadius: '1rem',
                boxShadow: '1px 2px 4px rgba(45, 45, 45, 0.4)'
              }}>
                <iframe
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '1rem'
                  }}
                  src="https://www.youtube.com/embed/6SE8bvTmmQc?si=DTMmGOHf3wyqIDTF"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>
            </div>

            <div style={{
              maxWidth: "50rem", 
              minWidth: 0,
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
              height: codeBoxHeight ? `${codeBoxHeight}px` : 0,
              borderRadius: '1rem',
              opacity: codeBoxHeight ? 1 : 0,
              visibility: codeBoxHeight ? 'visible' : 'hidden',
              transition: codeBoxHeight ? 'opacity 0.15s ease-in' : 'none'
            }}>
              <div style={{
                flex: 1,
                overflow: 'auto',
                minHeight: 0,
                maxHeight: '100%'
              }}>
                <SyntaxHighlighter
                  className="code"
                  language="cadence"
                  style={tomorrow}
                  showLineNumbers={true}
                >{example}</SyntaxHighlighter>
              </div>
            </div>
          </div>

          <div style={{maxWidth: "80rem", marginTop: "2rem", marginLeft: "auto", marginRight: "auto"}}>
            <p>
              Cadence is powering the next generation of Consumer DeFi, bringing institutional-grade security and consumer-friendly experiences to financial applications that serve millions.
            </p>
            <ul style={{ margin: '1.5rem 0', paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>User assets stay in user accounts, delivering better-than-fintech security without centralized risk.</li>
              <li style={{ marginBottom: '0.75rem' }}>Atomic transactions create seamless, one-click experiences that feel native to everyday users.</li>
              <li style={{ marginBottom: '0.75rem' }}>Always-on automation runs 24/7/365, enabling recurring payments and strategies that work while you sleep.</li>
              <li style={{ marginBottom: '0.75rem' }}>Real-time settlement in seconds, not days, making DeFi faster than traditional financial rails.</li>
              <li style={{ marginBottom: '0.75rem' }}>Open and composable by design, enabling global financial apps that work together seamlessly.</li>
            </ul>
            <p>
              Cadence pioneers <a href="https://cadence-lang.org/docs/language/resources">resource-oriented programming</a>—designed specifically to handle valuable digital assets.
              Unlike traditional smart contract languages where assets are piled in centralized contract storage, Cadence ensures user assets stay in their own accounts. The result is dramatically reduced attack surfaces and the elimination of entire classes of DeFi vulnerabilities.  
            </p>
            <p>
              With features like <a href="https://developers.flow.com/blockchain-development-tutorials/forte/flow-actions">Flow Actions</a> and <a href="https://developers.flow.com/blockchain-development-tutorials/forte/scheduled-transactions/scheduled-transactions-introduction">Scheduled Transactions</a>, developers can build sophisticated DeFi experiences that feel native to their users.
            </p>
            <p>
              Ready to build the future of finance? <a href="https://developers.flow.com/blockchain-development-tutorials/cadence/getting-started">Get started today</a>.
            </p>
          </div>

          <div className='arrow'><HiArrowSmDown/></div>
        </div>
        <div className="features">
          <div className="content-wrapper">

            <div className="feature alternate">
              <div>
                <h3>Complex DeFi Operations, Simple User Experiences</h3>
                <p>
                  In Cadence, transactions are first-class citizens. Write customized transactions that interact with multiple contracts atomically, either all succeed or all fail. No need for intermediary contracts or complex multi-call patterns.
                </p>
                <p>
                  Check staking positions, claim rewards, swap tokens, and restake all in one operation by writing a transaction.
                </p>
                <p>
                  Cadence scripts provide native data availability, querying on-chain data directly without external indexers. Build sophisticated analytics and experiences other chains cannot offer.
                </p>
                <p>
                  This flexibility makes Consumer DeFi possible. Complex operations feel simple while maintaining security and atomicity.
                </p>
              </div>
              <div>
               <Lottie animationData={powerAnimation} />
              </div>
            </div>

            <div className="feature">
              <div>
                <h3>Built for DeFi Security</h3>
                <p>
                  In DeFi, security isn't optional. The <a href="https://cadence-lang.org/docs/language/resources">resource-oriented programming paradigm</a> in Cadence fundamentally changes how assets are stored and protected. <strong>User assets stay in user accounts, not in contract storage.</strong>
                </p>
                <p>
                  Resources guarantee assets can only exist in one location, cannot be copied, and cannot be accidentally lost. Combined with a strong static type system, <a href="https://cadence-lang.org/docs/language/functions#function-preconditions-and-postconditions">enforced business logic</a>, and <a href="https://cadence-lang.org/docs/language/capabilities">capability-based access control</a>, Cadence eliminates entire classes of DeFi vulnerabilities including reentrancy attacks.
                </p>
                <p>
                  Build financial applications with confidence. Cadence provides safety guarantees that let you focus on creating value, not patching vulnerabilities.
                </p>
              </div>
              <div>
                <Lottie animationData={securityAnimation} />
              </div>
            </div>

            <div className="feature alternate">
              <div>
                <h3>Composable DeFi Primitives</h3>
                <p>
                  Compose powerful primitives to build sophisticated financial products. <a href="https://cadence-lang.org/docs/language/resources">Resources</a> stored in users' accounts can flow freely between contracts, which allows seamless integration of lending, swapping, and yield strategies in a single user experience.
                </p>
                <p>
                  <a href="https://developers.flow.com/blockchain-development-tutorials/forte/flow-actions">Flow Actions</a> allow you to bundle complex multi-step DeFi operations into one-click experiences.
                  <a href="https://developers.flow.com/blockchain-development-tutorials/forte/scheduled-transactions/scheduled-transactions-introduction">{" "}Scheduled Transactions</a> turn on native onchain automation. Recurring payments, DCA strategies, and portfolio rebalancing execute directly from user wallets, no backend servers required.  
                </p>
                <p>
                  <a href="https://cadence-lang.org/docs/language/interfaces">Interfaces</a> and <a href="https://cadence-lang.org/docs/language/attachments">attachments</a> make protocols truly composable.
                  Build new DeFi functionality on top of any token standard to create composable building blocks that work together seamlessly.
                </p>
              </div>
              <div>
                <Lottie animationData={composabilityAnimation} />
              </div>
            </div>

            <div className="feature">
              <div>
                <h3>Learn the Best Language for Consumer DeFi</h3> 
                <p>
                  Cadence is purpose-built for consumer DeFi applications. Its intuitive syntax and resource-oriented design make it the ideal language for building financial products that millions of users trust.
                </p>
                <p>
                  Learn a language designed from the ground up by smart contract developers for smart contract developers. With comprehensive documentation, powerful testing frameworks, and a supportive community, you'll be building production-ready consumer DeFi apps faster than with traditional smart contract languages.
                </p>
              </div>
              <div>
              <Lottie animationData={learnAnimation} />
              </div>
            </div>

          </div>
        </div>
      </main>
    </Layout>
  );
}
