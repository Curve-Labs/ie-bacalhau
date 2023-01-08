import React, { Provider, useState } from 'react'
import { ethers, Contract } from 'ethers'
import { BigNumber } from 'ethers'
import { abi } from '../contracts/Shrine.json'
import treeDump from '../components/tree.json'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { useWeb3Context } from '../context'
import { LedgerVersions } from '../components'
import truncateEthAddress from 'truncate-eth-address'

const token = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

interface Metadata {
  version: BigNumber
  newLedgerMetadataIPFSHash: string
}

interface StandardMerkleTreeData<T extends any[]> {
  format: 'standard-v1'
  tree: string[]
  values: {
    value: T
    treeIndex: number
  }[]
  leafEncoding: string[]
}

function Main() {
  const { provider, web3Provider, address } = useWeb3Context()
  const [textField, setTextField] = useState('')
  const [metadatas, setMetadatas] = useState<Metadata[]>([])
  const [shrine, setShrine] = useState<Contract | undefined>(undefined)
  const [version, setVersion] = useState<number | undefined>(undefined)
  const [tree, setTree] = useState<StandardMerkleTree<any> | undefined>(
    undefined
  )

  const getClaimOfVersion = (v: number) => {
    if (!tree) return

    console.log(tree)

    const allClaims = Array.from(tree.entries())
    const ownClaims = allClaims.filter(
      ([idx, [beneficiaryAddress, value]]) => address === beneficiaryAddress
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

    // retrieve tree dump from ipfs
    const tree = StandardMerkleTree.load(
      treeDump as StandardMerkleTreeData<any>
    ) as StandardMerkleTree<any>

    setShrine(shrine)
    setVersion(currentLedgerVersion.toNumber())
    setTree(tree)
  }

  const handleClaim = async (index: number, shares: number) => {
    //   Version version;
    //   ERC20 token;
    //   Champion champion;
    //   uint256 shares;
    //   bytes32[] merkleProof;
    console.log(tree?.root)
    console.log(tree?.render())

    if (!tree) return
    const proof = tree.getProof(index)
    const claimInfo = {
      version: 1,
      token,
      champion: address,
      shares: shares,
      merkleProof: proof,
    }

    console.log(claimInfo)
    console.log(shrine)
    const tx = await shrine?.claim(address, claimInfo)
  }

  return (
    <main className="grow p-8 text-center">
      <div className="mb-6">
        <h1 className="pb-8 text-4xl font-bold">Shrine</h1>
        <h2 className="mt-0 mb-2 text-base font-medium">Claim your tokens!</h2>
      </div>
      <div className="flex justify-center">
        {!shrine ? (
          <div className="flex w-7/12 flex-col p-6">
            <p className="mb-2 text-base">
              Enter the address of the Shrine contract that you want to claim
              from:
            </p>
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
              Search for airdrop
            </button>
          </div>
        ) : (
          <div className="flex w-5/12 min-w-min flex-col p-6 text-left">
            <div className="mb-12 flex flex-row items-center justify-between border p-6">
              <div className="flex flex-row items-center">
                <span className="mr-8 block text-sm font-medium text-gray-700">
                  Shrine:
                </span>
                <span className="mr-8 block text-sm font-medium text-gray-700">
                  {truncateEthAddress(shrine.address)}
                </span>
              </div>
              {version && (
                <LedgerVersions metadatas={metadatas} version={version} />
              )}
            </div>
            {metadatas &&
              version &&
              metadatas.map((meta) => {
                const claim = getClaimOfVersion(meta.version.toNumber())
                return (
                  <div
                    className="flex justify-between p-3"
                    key={meta.version.toNumber()}
                  >
                    <div className="flex flex-row items-center">
                      <span className="mr-8 block text-sm font-medium text-gray-700">
                        Shares:
                      </span>
                      <span className="mr-8 block text-sm font-medium text-gray-700">
                        {claim?.value}
                      </span>
                    </div>
                    <button
                      className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                      onClick={() => handleClaim(claim?.index, claim?.value)}
                    >
                      Claim
                    </button>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </main>
  )
}

export default Main
