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
      'kjzl6cwe1jw14772nexn0fxyl6az7aqm59i1lbbftcu6tudf4qkql6hsquci6d3',
  },
  schemas: {
    Contribution:
      'ceramic://k3y52l7qbv1fryooxshuoshsgifc2zumqjupq85bgk7i716fh2iixe2lr8vqhmxa8',
    Contributions:
      'ceramic://k3y52l7qbv1fryngdjw1xfs253mckpji81gkb82nql28wf84mkjj5j5ci2wyvh3pc',
  },
  tiles: {
    'week 1': 'kjzl6cwe1jw1494tmvqmrgnvw94qcv8tqhlvnzb5b4lixr7z3ik517r8ryi0iya',
  },
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
