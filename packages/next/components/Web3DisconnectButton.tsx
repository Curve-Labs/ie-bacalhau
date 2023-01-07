import React from 'react'
import { useWeb3Context } from '../context'

interface DisconnectProps {
  disconnect: (() => Promise<void>) | null
}

const DisconnectButton = ({ disconnect }: DisconnectProps) => {
  return disconnect ? (
    <button
      onClick={disconnect}
      className="block w-full px-4 py-2 text-sm text-gray-700"
    >
      Disconnect
    </button>
  ) : (
    <button>Loading...</button>
  )
}

export function Web3DisconnectButton() {
  const { disconnect } = useWeb3Context()

  return <DisconnectButton disconnect={disconnect} />
}
