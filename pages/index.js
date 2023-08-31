import Head from 'next/head';
import Link from 'next/link';

import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { FcLock, FcIdea, FcChargeBattery, FcMindMap } from 'react-icons/fc';
import { HiArrowRight, HiArrowSmDown } from 'react-icons/hi';

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
      </Head>

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
              Announced in 2020, the Cadence programming language introduced the new paradigm of resource-oriented programming.
              By leveraging the power of resources, Cadence brings exciting new ideas to the world of smart contracts.
            </p>
            <p>
              Cadence makes it easy to write maximally on-chain smart contracts that are secure by design.<br/>
              Our goals for Cadence are to enable ambitious developers to make daring and complex ideas possible,
              while making them easy, fun and developer-friendly, as well as safe and secure.
            </p>
            <p>
              Experience the smart contract revolution with Cadence – where innovation, security, and collaboration converge.
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
                  As smart contracts often deal with valuable assets, Cadence provides the resource-oriented programming paradigm,
                  which guarantees that assets can only exist in one location at a time, cannot be copied, and cannot be accidentally lost or deleted.
                  With <a href="https://developers.flow.com/cadence/language/resources">resources</a>,
                  digital assets are first-class citizens, making their accidental loss or malicious duplication impossible.
                </p>
                <p>
                  Cadence includes several language features which prevent entire classes of bugs.
                  For example, it accomplishes this via a strong static type system, <a href="https://developers.flow.com/cadence/language/functions#function-preconditions-and-postconditions">design by contract</a>,
                  and <a href="https://developers.flow.com/cadence/language/capability-based-access-control">capability-based access control</a>.
                </p>
                <p>
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
                  <a href="https://developers.flow.com/cadence/language/resources">Resources</a> are stored directly in users' accounts,
                  and can flow freely between contracts:
                  They can be passed as arguments to functions, returned from functions, or even combined in arbitrary data structures.
                  This makes implementing business logic easier, more natural and promotes reuse of existing logic.
                </p>
                <p>
                  <a href="https://developers.flow.com/cadence/language/interfaces">Interfaces</a> allow contracts and resources to expose functionality
                  to other programs, and allows them to use other programs, enabling an organic ecosystem of programs that interoperate with each other.
                  By using interfaces, developers can easily integrate their applications into existing ecosystems,
                  and invite and support future applications into it.
                </p>
                <p>
                  In addition, the <a href="https://developers.flow.com/cadence/language/attachments">attachments</a> feature
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
                <h3><FcIdea/> Easy to Learn, Build and Ship</h3>
                <p>
                  Cadence's syntax is inspired by popular modern general-purpose programming languages like Swift, Kotlin, and Rust,
                  so developers will find the syntax and the semantics familiar.
                  Practical tooling, <a href="https://developers.flow.com/cadence/language">documentation</a>,
                  and examples enable developers to start creating programs quickly and effectively.
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
                  Cadence comes with great IDE support. Use your favorite editor,
                  like <a href="https://marketplace.visualstudio.com/items?itemName=onflow.cadence">Visual Studio Code</a>,
                  Vim or Emacs, to get diagnostics, code completion, refactoring support, and more.
                </p>
                <p>
                  To further enhance the developer experience, there is also a
                  native testing framework, which allows developers to write
                  unit & integration tests using Cadence. The framework can
                  also generate code coverage insights.
                </p>
              </div>
              <div>
                <Lottie animationData={debuggingAnimation} />
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
 }
