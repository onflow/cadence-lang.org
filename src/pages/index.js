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

const example = `access(all)
resource NFT {

    access(all)
    fun greet(): String {
        return "I'm NFT #"
            .concat(self.uuid.toString())
    }
}

access(all)
fun main(): String {
    let nft <- create NFT()
    let greeting = nft.greet()
    destroy nft
    return greeting
}`

function cadence(Prism) {
  Prism.languages.cadence = {
    string: {
      pattern: /"[^"]*"/,
      greedy: true
    },
    keyword:
      /\b(?:access|all|fun|resource|create|let|destroy|return|self)\b/,
    'class-name': /\b[A-Z][A-Za-z_\d]*\b/,
    function: /\b[a-z_]\w*(?=\s*\()/i,
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
      title={`Hello from ${siteConfig.title}`}
      description="Cadence is a resource-oriented programming language that introduces new features to smart contract programming that help developers ensure that their code is safe, secure, clear, and approachable.">
      <main>

      <div className="content-wrapper">
          <div className="feature">
            <div>
            <Head>
              <title>Cadence</title>
            </Head>
              <Logo title="Cadence" className="logo" width="18em" height="4em" />
              <h2>
                Forge the future of decentralized apps.
                <br/>
                Unleash <strong>utility</strong>, <strong>composability</strong>,
                <br/>
                and <strong>safety</strong> in smart contracts.
              </h2>

              <Link className="cta" href="/learn">
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
              Together, we are working to build a programming language to empower everyone to push the boundaries of smart contracts and on-chain logic.
            </p>
            <p>
              Announced in 2020, the Cadence programming language introduced a new paradigm of resource-oriented programming.
              By leveraging the power of resources, Cadence brings exciting new ideas to the world of smart contracts.
              Cadence makes it easy to write maximally on-chain smart contracts that are secure by design.
              Our goals for Cadence are to enable ambitious developers to make daring & complex ideas possible while making them easy,
              fun & developer-friendly, as well as safe and secure.
            </p>
            <p>
              Join us in shaping the future of blockchain, one line of code at a time. Get started today!
            </p>
          </div>

          <div className='arrow'><HiArrowSmDown/></div>
        </div>
        <div className="features">
          <div className="content-wrapper">

            <div className="feature">
              <div>
                <h3><FcLock/> Safety by design</h3>
                <p>
                  Cadence provides security and safety guarantees that greatly simplify the development of secure smart contracts.
                </p>
                <p>
                  As smart contracts often deal with valuable assets, Cadence provides the <a href="https://cadence-lang.org/docs/language/resources">resource-oriented programming paradigm</a>,
                  which guarantees that assets can only exist in one location at a time, cannot be copied, and cannot be accidentally lost or deleted.
                </p>
                <p>
                  Cadence includes several language features that prevent entire classes of bugs via a strong static type system, <a href="https://cadence-lang.org/docs/language/functions#function-preconditions-and-postconditions">design by contract</a>,
                  and <a href="https://cadence-lang.org/docs/language/capabilities">capability-based access control</a>.
                </p>
                <p>
                  These security and safety features allow smart contract developers to focus on the business logic of their contract,
                  instead of preventing security footguns and attacks.
                </p>
              </div>
              <div>
                <Lottie animationData={securityAnimation} />
              </div>
            </div>

            <div className="feature alternate">
              <div>
                <h3><FcMindMap/>Built for permissionless composability</h3>
                <p>
                  <a href="https://cadence-lang.org/docs/language/resources">Resources</a> are stored directly in users' accounts,
                  and can flow freely between contracts. They can be passed as arguments to functions, returned from functions, or even combined in arbitrary data structures.
                  This makes implementing business logic easier and promotes the reuse of existing logic.
                </p>
                <p>
                  <a href="https://cadence-lang.org/docs/language/interfaces">Interfaces</a> enable interoperability of contracts and resources allowing
               developers to integrate their applications into existing experiences easily.
                </p>
                <p>
                  In addition, the <a href="https://cadence-lang.org/docs/language/attachments">attachments</a> feature
                  of Cadence allows developers to extend existing types with new functionality and data,
                  without requiring the original author of the type to plan or account for the intended behavior.
                </p>
              </div>
              <div>
                <Lottie animationData={composabilityAnimation} />
              </div>
            </div>

            <div className="feature">
              <div>
                <h3><FcIdea/> Easy to learn, build and ship</h3>
                <p>
                  Cadence's syntax is inspired by popular modern general-purpose programming languages like Swift, Kotlin, and Rust,
                  so developers will find the syntax and the semantics familiar.
                  Practical tooling, <a href="https://cadence-lang.org/docs/language">documentation</a>,
                  and examples enable developers to start creating programs quickly and effectively.
                </p>
              </div>
              <div>
              <Lottie animationData={learnAnimation} />
              </div>
            </div>

            <div className="feature alternate">
              <div>
                <h3><FcChargeBattery/>Powerful transactions for mainstream experiences</h3>
                <p>
                  In Cadence, a transaction has a lot more flexibility and the power to perform multiple operations with a single transaction,
                  as opposed to multiple, separate smart contract calls like in other languages.
                  It allows complex, multi-step interactions to be one-click user experiences.
                </p>
                <p>
                  Developers can easily batch multiple transactions, turning complicated user journeys into a few clicks.
                  For example, imagine approving and completing the listing of an NFT from a new collection in the same transaction,
                  or adding and sending funds with just one approval.
                </p>
              </div>
              <div>
               <Lottie animationData={powerAnimation} />
              </div>
            </div>

            <div className="feature">
              <div>
                <h3>🧰 Best-in-class tooling</h3>
                <p>
                  Cadence comes with great IDE support. Use your favorite editor,
                  like <a href="https://marketplace.visualstudio.com/items?itemName=onflow.cadence">Visual Studio Code</a>,
                  Vim or Emacs, to get diagnostics, code completion, refactoring support, and more.
                </p>
                <p>
                  To further enhance the developer experience, there is also a
                  native testing framework, which allows developers to write
                  unit & integration tests using Cadence.
                </p>
              </div>
              <div>
                <Lottie animationData={debuggingAnimation} />
              </div>
            </div>

          </div>
        </div>
      </main>
    </Layout>
  );
}
