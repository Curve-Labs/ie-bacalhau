import React from 'react'
import { useWeb3Context } from '../context'

interface ConnectProps {
  connect: (() => Promise<void>) | null
}
const ConnectButton = ({ connect }: ConnectProps) => {
  return connect ? (
    <button
      onClick={connect}
      className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  ) : (
    <button>Loading...</button>
  )
}

export function Web3ConnectButton() {
  const { connect } = useWeb3Context()

  return <ConnectButton connect={connect} />
}
