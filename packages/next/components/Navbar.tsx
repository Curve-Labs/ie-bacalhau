import React from 'react'
import Link from 'next/link'
import { Web3Button, Web3Address } from './index'

export const Navbar = () => {
  return (
    <nav className="flex flex-row justify-between bg-indigo-500 p-4">
      <Link href="/about">
        <a className="text-lg font-light">About</a>
      </Link>
      <Web3Address />
      <Web3Button />
    </nav>
  )
}
