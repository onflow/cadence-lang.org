import '../styles/global.css'

import localFont from 'next/font/local'

import Layout from '../components/layout'

const font = localFont({
  src: [
    {
      path: './e-Ukraine-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './e-Ukraine-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './e-Ukraine-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './e-Ukraine-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
})

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${font.style.fontFamily};
        }
      `}</style>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
