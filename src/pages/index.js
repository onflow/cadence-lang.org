import React from 'react';
import clsx from 'clsx';
import Head from 'next/head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import { FcLock, FcIdea, FcChargeBattery, FcMindMap } from 'react-icons/fc';
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
import "FlowTransactionScheduler"

// Schedule recurring yield compounding
transaction(stakingPid: UInt64, intervalDays: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        // Compose DeFi actions atomically:
        // Claim rewards → Swap → Restake
        let rewardsSource = StakingConnectors.PoolRewardsSource(
            userCertificate: signer.capabilities
                .get<&StakingPool>(publicPath),
            pid: stakingPid
        )

        let swapper = SwapConnectors.TokenSwapper(
            source: rewardsSource,
            targetToken: "FLOW"
        )

        let stakeSink = StakingConnectors.PoolStakeSink(
            pool: stakingPool,
            source: swapper
        )

        // Schedule to run every N days
        let future = getCurrentBlock().timestamp
            + (intervalDays * 86400.0)

        FlowTransactionScheduler.schedule(
            action: stakeSink,
            timestamp: future,
            recurring: true
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
  return (
    <Layout
      title={`${siteConfig.title} - Build the Future of Consumer DeFi`}
      description="Ship Consumer DeFi products faster. Cadence delivers the security, automation, and tooling to build financial apps that millions trust.">
      <main>

      <div className="content-wrapper">
          <div className="feature">
            <div>
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
            </div>

            <div style={{maxWidth: "30rem"}}>
              <SyntaxHighlighter
                className="code"
                language="cadence"
                style={tomorrow}
                showLineNumbers={true}
              >{example}</SyntaxHighlighter>
            </div>
          </div>

          <div style={{maxWidth: "58rem", marginTop: "-1rem"}}>
            <p>
              Cadence is powering the next generation of Consumer DeFi, bringing institutional-grade security and consumer-friendly experiences to financial applications that serve millions.
            </p>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src="https://www.youtube.com/embed/6SE8bvTmmQc?si=DTMmGOHf3wyqIDTF"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
            <p>
              Cadence pioneers <a href="https://cadence-lang.org/docs/language/resources">resource-oriented programming</a>—a paradigm designed specifically for handling valuable digital assets.
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
                <h3><FcChargeBattery/>Complex DeFi Operations, Simple User Experiences</h3>
                <p>
                  In Cadence, transactions are first-class citizens. Write detailed, customized transactions that interact with multiple contracts atomically, either all succeed or all fail. No need to deploy intermediary contracts or build complex multi-call patterns.
                </p>
                <p>
                  Want to check a user's staking position across three protocols, claim rewards from two pools, swap tokens, and restake—all in one operation? Write it as a transaction. This level of composability and customization simply isn't possible on other platforms where you're limited to pre-deployed contract functions.
                </p>
                <p>
                  Cadence scripts provide native data availability—query any on chain data directly from state without external indexers or APIs. Build sophisticated analytics and user experiences that other chains cannot offer.
                </p>
                <p>
                  This transactional flexibility is what makes Consumer DeFi possible. Complex financial operations that feel simple, all while maintaining security and atomicity.
                </p>
              </div>
              <div>
               <Lottie animationData={powerAnimation} />
              </div>
            </div>

            <div className="feature">
              <div>
                <h3><FcLock/> Built for DeFi Security</h3>
                <p>
                  In DeFi, security isn't optional. The <a href="https://cadence-lang.org/docs/language/resources">resource-oriented programming paradigm</a> in Cadence fundamentally changes how assets are stored and protected.
                </p>
                <p>
                  <strong>User assets stay in user accounts, not in contract storage.</strong> This architectural decision dramatically reduces attack surfaces.
                  Unlike Solidity where exploits can drain entire protocols in one transaction, the Cadence model makes attacks exponentially harder. Attackers must target individual accounts one at a time, with no easy list of vulnerable targets.
                </p>
                <p>
                  Resources guarantee that assets can only exist in one location at a time, cannot be copied, and cannot be accidentally lost or deleted.
                  Combined with a strong static type system, <a href="https://cadence-lang.org/docs/language/functions#function-preconditions-and-postconditions">enforced business logic</a>,
                  and <a href="https://cadence-lang.org/docs/language/capabilities">capability-based access control</a>, Cadence eliminates entire classes of DeFi vulnerabilities including reentrancy attacks.
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
                <h3><FcMindMap/>Composable DeFi Primitives</h3>
                <p>
                  Build sophisticated financial products by composing powerful primitives. <a href="https://cadence-lang.org/docs/language/resources">Resources</a> stored in users' accounts can flow freely between contracts, enabling seamless integration of lending, staking, swapping, and yield strategies in a single user experience.
                </p>
                <p>
                  <a href="https://developers.flow.com/blockchain-development-tutorials/forte/flow-actions">Flow Actions</a> allow you to bundle complex multi-step DeFi operations into one-click experiences.
                  <a href="https://developers.flow.com/blockchain-development-tutorials/forte/scheduled-transactions/scheduled-transactions-introduction">{" "}Scheduled Transactions</a> enable native on-chain automation. Recurring payments, DCA strategies, and portfolio rebalancing execute directly from user wallets, no backend servers required.  
                </p>
                <p>
                  <a href="https://cadence-lang.org/docs/language/interfaces">Interfaces</a> and <a href="https://cadence-lang.org/docs/language/attachments">attachments</a> make protocols truly composable.
                  Build new DeFi functionality on top of any token standard, creating composable building blocks that work together seamlessly.
                </p>
              </div>
              <div>
                <Lottie animationData={composabilityAnimation} />
              </div>
            </div>

            <div className="feature">
              <div>
                <h3><FcIdea/> Built for Scale: Fast, Cheap, and Ready for Millions</h3> 
                <p>
                  Cadence is designed for speed. Intuitive syntax, comprehensive testing frameworks, and powerful abstractions mean you spend less time debugging and more time building. Development cycles that took months in Solidity take days in Cadence.
                </p>
                <p>
                  The development time has been reduced from months to days, enabling rapid iteration and faster time-to-market for DeFi products. Ship faster, test in production with confidence, and capture market opportunities before your competitors.
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
