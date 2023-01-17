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
      <main className="grow p-8 text-center">
        <div className="flex justify-center">
          <Link href="/shrine">Claim</Link>
        </div>
        <div className="flex justify-center">
          <Link href="/contribute">Contribute</Link>
        </div>
        <div className="flex justify-center">
          <Link href="/manage">Manage</Link>
        </div>
      </main>
    </div>
  )
}

export default Home
