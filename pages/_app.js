import '../styles/global.css';

import { Lexend_Deca } from 'next/font/google'

const font = Lexend_Deca({ subsets: ['latin'] })

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${font.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
