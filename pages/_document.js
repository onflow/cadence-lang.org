import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
        <Head>
            <meta name="description" content="The resource-oriented smart contract programming language" />
            <link rel="icon" href="/favicon.ico" />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="Cadence" />
            <meta property="og:description" content="The resource-oriented smart contract programming language" />
            <meta property="og:url" content="https://cadence-lang.org" />
        </Head>
        <body>
            <Main />
            <NextScript />
        </body>
    </Html>
  )
}