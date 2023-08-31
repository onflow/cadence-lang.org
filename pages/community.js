
import Head from 'next/head'

export default function Community() {
    return <>
        <Head>
            <title>Cadence: Community</title>
        </Head>
        <main>
            <div className="content-wrapper">
                <h1>Community</h1>
                <p>Welcome to the Cadence community!</p>
                <p>Together, we are working to build a programming language to empower everyone to push the boundaries of smart contracts and on-chain logic.</p>
                <p>
                    Contributing to Cadence is easy. You can join the community by:
                </p>
                <ul>
                    <li>
                        <strong>
                            <span className='icon'>⭐</span> Opening a
                            {" "}<a href="https://github.com/onflow/cadence/issues/new?assignees=turbolent&labels=Feature%2CFeedback&projects=&template=feature-request.yaml">feature request</a> or
                            {" "}<a href="https://github.com/onflow/cadence/issues/new?assignees=turbolent&labels=Feature%2CFeedback&projects=&template=feature-request.yaml">improvement request</a>
                        </strong>
                    </li>
                    <li>
                        <strong>
                            <span className='icon'>🛠</span> Working on a feature or improvement.
                        </strong>
                        <p>
                            There are several good first issues that are looking for contributors
                            {" "}<a href="https://github.com/onflow/cadence/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22Good+First+Issue%22">in the main Cadence repository</a> and
                            {" "}<a href="https://github.com/onflow/cadence-tools/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22Good+First+Issue%22">in the Cadence tools repository</a>.
                        </p>
                    </li>
                    <li>
                        <strong>
                            <span className='icon'>💬</span> Participating
                            in the <a href="https://github.com/onflow/flips/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%22flip%3A+cadence%22">FLIP (Flow Improvement Proposal) discussions</a>.
                        </strong>
                        <p>
                            <a href="https://github.com/onflow/flips#flips-flow-improvement-proposals">Learn more about FLIPs</a>
                        </p>
                    </li>
                    <li>
                        <strong>
                            <span className='icon'>💭</span> Joining
                            the <a href="https://docs.google.com/document/d/1KMGdiZ7qX9aoyH2WEVGHjsvBTNPTN6my8LcNmSVivLQ/edit">Cadence Language Design Meetings</a> to
                            discuss the design and implementation of Cadence.
                        </strong>
                        <p>
                            In the meetings, the core contributors and the community investigate, design, and ultimately decide on language features.
                        </p>
                    </li>
                </ul>
            </div>
        </main>
    </>
}