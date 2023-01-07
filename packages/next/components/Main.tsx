import React, { Provider, useState } from 'react'
import { ethers, Contract } from 'ethers'
import { abi } from '../contracts/Shrine.json'
import treeDump from './tree.json'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { useWeb3Context } from '../context'

interface StandardMerkleTreeData<T extends any[]> {
  format: 'standard-v1'
  tree: string[]
  values: {
    value: T
    treeIndex: number
  }[]
  leafEncoding: string[]
}

export function Main() {
  const { provider, web3Provider, address } = useWeb3Context()
  const [textField, setTextField] = useState('')
  const [metadatas, setMetadatas] = useState<string[][]>([])
  const [shrine, setShrine] = useState<Contract | undefined>(undefined)
  const [version, setVersion] = useState<number | undefined>(undefined)
  const [tree, setTree] = useState<StandardMerkleTree<any> | undefined>(
    undefined
  )

  const getClaimOfVersion = (version: number) => {
    if (!tree) return

    const allClaims = Array.from(tree.entries())
    const ownClaims = allClaims.filter(
      ([version, [beneficiaryAddress, value]]) => address === beneficiaryAddress
    )
    const latestClaim = ownClaims.sort((a, b) => b[0] - a[0])[0]
    const [index, [beneficiaryAddress, value]] = latestClaim

    return {
      index,
      beneficiaryAddress,
      value,
    }
  }

  const handleSearch = async () => {
    const isAddress = ethers.utils.isAddress(textField)
    if (!isAddress) return
    const shrine = new ethers.Contract(
      textField,
      abi,
      web3Provider?.getSigner()
    )
    // get ledger metadata from shrine (ipfs hash)
    // TODO fromBlock, toBlock logic
    const currentLedgerVersion = await shrine.currentLedgerVersion()
    const events = await shrine.queryFilter('UpdateLedgerMetadata', 0, 1000)
    setMetadatas(events.map((e) => e?.decode(e.data, e.topics)))
    // const lastEvent = events[events.length - 1]
    // const lastIpfs = lastEvent?.decode(
    // lastEvent.data,
    // lastEvent.topics
    // ).newLedgerMetadataIPFSHash

    // console.log(lastEvent.decode())
    // retrieve tree dump from ipfs
    const tree = StandardMerkleTree.load(
      treeDump as StandardMerkleTreeData<any>
    ) as StandardMerkleTree<any>

    // const allClaims = Array.from(tree.entries())
    // const ownClaims = allClaims.filter(
    //   ([version, [beneficiaryAddress, value]]) => address === beneficiaryAddress
    // )
    setShrine(shrine)
    setVersion(currentLedgerVersion)
    setTree(tree)
  }

  const handleClaim = async () => {
    //   Version version;
    //   ERC20 token;
    //   Champion champion;
    //   uint256 shares;
    //   bytes32[] merkleProof;
    const claimInfo = {}
    const tx = await shrine?.claim(address)
  }

  if (metadatas.length > 0) {
  }

  console.log(getClaimOfVersion(version))

  return (
    <main className="grow p-8 text-center">
      <div className="mb-6">
        <h1 className="pb-8 text-4xl font-bold">Shrine</h1>
        <h2 className="mt-0 mb-2 text-base font-medium">Claim your tokens!</h2>
      </div>
      <div className="flex justify-center">
        {!shrine ? (
          <div className="flex w-7/12 flex-col p-6">
            <input
              type="text"
              className="mb-4 block w-full rounded-lg border-2 border-gray-300 p-2"
              placeholder="Shrine Address"
              value={textField}
              onChange={(e) => setTextField(e.target.value)}
            />
            <button
              className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={handleSearch}
            >
              Search airdrop
            </button>
          </div>
        ) : (
          <div className="flex w-7/12 flex-col p-6">
            <p>Connected to shrine: {shrine.address}</p>
            <p>Eligible amount: {getClaimOfVersion(version)?.value}</p>
            <button
              className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={handleClaim}
            >
              Claim airdrop
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
