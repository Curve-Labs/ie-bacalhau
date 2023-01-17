import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <div className="flex h-screen flex-col">
      <Head>
        <title>Impact Evaluator</title>
        <meta name="description" content="Boilerplate for Web3 dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex grow flex-col items-center p-8 text-center">
        <div className="mb-6 w-3/12 rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700">
          <Link href="/rewards">Claim your rewards</Link>
        </div>
        <div className="mb-6 w-3/12 rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700">
          <Link href="/contributions">Manage your contributions</Link>
        </div>
        <div className="mb-6 w-3/12 rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700">
          <Link href="/airdrop">Specify an airdrop</Link>
        </div>
      </main>
    </div>
  )
}

export default Home
