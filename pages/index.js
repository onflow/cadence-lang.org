import Head from 'next/head';

import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { FcLock, FcIdea, FcChargeBattery, FcMindMap } from 'react-icons/fc';
import { HiArrowRight } from 'react-icons/hi';

import Lottie from "lottie-react";
import securityAnimation from "./security.json";
import debuggingAnimation from "./debugging.json";
import composabilityAnimation from "./composability.json";
import powerAnimation from "./power.json";
import learnAnimation from "./learn.json";

const example = `pub resource NFT {
  pub fun greet(): String {
    return "I'm NFT #"
      .concat(self.uuid.toString())
  }
}

pub fun main(): String {
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
      /\b(?:pub|fun|resource|create|let|destroy|return|self)\b/,
    'class-name': /\b[A-Z][A-Za-z_\d]*\b/,
    function: /\b[a-z_]\w*(?=\s*\()/i,
  }
}

cadence.displayName = 'cadence'

SyntaxHighlighter.registerLanguage('cadence', cadence)


export default function Home() {
  return (
    <>
      <Head>
        <title>Cadence</title>
        <meta name="description" content="The resource-oriented smart contract programming language" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="index, follow" />
      </Head>

      <nav>
        <div className="content-wrapper">
          <span className="logo">Cadence</span>
          <a href="https://developers.flow.com/cadence/">Learn</a>
          <a href="https://play.flow.com/">Playground</a>
          <a href="https://developers.flow.com/cadence/language">Documentation</a>
          <a href="https://flow.com/flow-responsible-disclosure">Security</a>
          <a href="https://github.com/onflow/cadence" title="GitHub"><FaGithub/></a>
          <a href="https://discord.com/invite/J6fFnh2xx6" title="Discord"><FaDiscord/></a>
        </div>
      </nav>

      <main>
        <div className="content-wrapper">
          <div className="feature">
            <div>
              <h1>Cadence</h1>
              <h2>
                Forge the future of decentralized apps.
                <br/>
                Unleash <strong>utility</strong>, <strong>composability</strong>,
                <br/>
                and <strong>safety</strong> in smart contracts.
              </h2>

              <a className="cta" href="https://developers.flow.com/cadence/tutorial/first-steps">
                Get started <HiArrowRight/>
              </a>
            </div>

            <div style={{"max-width": "30rem"}}>
              <SyntaxHighlighter
                className="code"
                language="cadence"
                style={tomorrow}
                showLineNumbers={true}
              >{example}</SyntaxHighlighter>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="content-wrapper">

            <div className="feature">
              <div>
                <h3><FcLock/> Safety by design</h3>
                <p>
                  Cadence provides security and safety guarantees that greatly simplify the development of secure smart contracts.
                </p>
                <p>
                  As smart contracts often deal with valuable assets, Cadence provides the resource-oriented programming paradigm,
                  which guarantees that assets can only exist in one location at a time, cannot be copied, and cannot be accidentally lost or deleted.
                </p>
                <p>
                  Cadence includes several language features which prevent entire classes of bugs.
                  These security and safety features allow smart contract developers to focus on the business logic of their contract,
                  instead of preventing accidents and attacks.
                </p>
              </div>
              <div>
                <Lottie animationData={securityAnimation} />
              </div>
            </div>

            <div className="feature alternate">
              <div>
                <h3><FcMindMap/> Permissionless Composability</h3>
                <p>
                  Cadence enables composability.
                </p>
                <p>
                  Resources are stored directly in users' accounts, and can flow freely between contracts:
                  They can be passed as arguments to functions, returned from functions, or even combined in arbitrary data structures.
                  This makes implementing business logic easier, more natural and promotes reuse of existing logic.
                </p>
                <p>
                  In addition, the attachments feature of Cadence allows developers to extend existing types with new functionality and data,
                  without requiring the original author of the type to plan or account for the intended behavior.
                </p>
              </div>
              <div>
                <Lottie animationData={composabilityAnimation} />
              </div>
            </div>

            <div className="feature">
              <div>
                <h3><FcIdea/> Simplicity</h3>
                <p>
                  Cadence's syntax is inspired by popular modern general-purpose programming languages like Swift, Kotlin, and Rust,
                  so developers will find the syntax and the semantics familiar.
                  Practical tooling, documentation, and examples enable developers to start creating programs quickly and effectively.
                </p>
                <p>
                  Hundreds of developers were able to learn Cadence quickly and develop production-quality smart contracts with it shortly.
                </p>
              </div>
              <div>
              <Lottie animationData={learnAnimation} />
              </div>
            </div>

            <div className="feature alternate">
              <div>
                <h3><FcChargeBattery/> Powerful Transactions</h3>
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
                <h3>🧰 Best-In-Class Tooling</h3>
                <p>
                  Cadence comes with great IDE support. Use your favorite editor, like VS Code, Vim or Emacs,
                  to get diagnostics, code completion, refactoring support, and more.
                </p>
              </div>
              <div>
                <Lottie animationData={debuggingAnimation} />
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer>
        <div className="content-wrapper">
          <div className="license">
            Except as otherwise noted, this site is licensed under a Creative Commons Attribution 4.0 International License,
            and code samples are licensed under the 3-Clause BSD License.
          </div>
        </div>
      </footer>
    </>
  )
 }
