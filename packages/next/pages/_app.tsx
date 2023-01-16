import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3ContextProvider } from '../context'
import { ToastContainer } from 'react-toastify'
import { Navbar } from '../components'
import { Provider } from '@self.id/framework'

import 'react-toastify/dist/ReactToastify.css'

const aliases = {
  definitions: {
    contributions:
      'kjzl6cwe1jw147ealt0w4nbea8kfnf214a7slb9zsw3tc18vax6cty85ampap3y',
  },
  schemas: {
    Contribution:
      'ceramic://k3y52l7qbv1frxynpy6ilu8azuscd5neg4njfd9jf9jyp5uajxxju9uu8cxbp22v4',
    Contributions:
      'ceramic://k3y52l7qbv1frxtj20co0up5lbsukhanc4u62j4gx9tzkwwh6s25x0lgnqbptzt34',
  },
  tiles: {},
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ContextProvider>
      <Provider client={{ ceramic: 'testnet-clay', aliases }}>
        <Navbar />
        {/*
        // @ts-ignore */}
        <Component {...pageProps} />
        <ToastContainer
          hideProgressBar
          position="bottom-right"
          autoClose={2000}
        />
      </Provider>
    </Web3ContextProvider>
  )
}

export default MyApp
