import type { NextPage } from 'next'
import Head from 'next/head'
import { Navbar, Main } from '../components/'
import { useRouter } from 'next/router'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <div className="flex h-screen flex-col">
      <Head>
        <title>Web3 Next-Boilerplate</title>
        <meta name="description" content="Boilerplate for Web3 dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grow p-8 text-center">
        <div className="flex justify-center">
          <Link href="/shrine">Claim</Link>
        </div>
      </main>
      <footer className="justify-end p-4">
        <p className="text-lg font-light">Footer</p>
      </footer>
    </div>
  )
}

export default Home
