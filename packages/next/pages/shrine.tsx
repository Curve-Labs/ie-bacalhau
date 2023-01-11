import React, { useState, useEffect } from 'react'
import { ethers, Contract, BigNumber, Event } from 'ethers'
import { toast } from 'react-toastify'
import { abi } from '../contracts/Shrine.json'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { useWeb3Context } from '../context'
import { LedgerVersions, Web3ConnectButton } from '../components'
import truncateEthAddress from 'truncate-eth-address'
import axios from 'axios'

interface Metadata {
  version: number
  newLedgerMetadataIPFSHash: string
}

interface Claim {
  index: number
  address: string
  shares: number
}

interface PastClaim {
  champion: string
  claimedTokenAmount: number
  recipient: string
  token: string
  version: BigNumber
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
  const { web3Provider, address } = useWeb3Context()
  const [shrineTextField, setShrineTextField] = useState('')
  const [tokenTextField, setTokenTextField] = useState('')
  const [metadatas, setMetadatas] = useState<Metadata[]>([])
  const [shrine, setShrine] = useState<Contract | undefined>(undefined)
  const [version, setVersion] = useState<number | undefined>(undefined)
  const [tree, setTree] = useState<StandardMerkleTree<any> | undefined>(
    undefined
  )
  const [userClaim, setUserClaim] = useState<Claim | undefined>(undefined)
  const [pastUserClaims, setPastUserClaims] = useState<PastClaim[] | undefined>(
    undefined
  )

  useEffect(() => {
    if (!version) return

    const asyncFunction = async () => {
      if (!shrine) return

      const versionEvents = await shrine.queryFilter(
        'UpdateLedgerMetadata',
        0,
        1000
      )
      const decodedVersionEvents = versionEvents.map((e) =>
        e?.decode(e.data, e.topics)
      )
      const newTree = await getTreeForVersion(version, decodedVersionEvents)
      const pastClaims = await getPastUserClaimsForVersion(version)
      const claim = await getUserClaimForVersion(version, newTree)

      setMetadatas(decodedVersionEvents)
      setPastUserClaims(pastClaims)
      setUserClaim(claim)
      setTree(newTree)
    }

    asyncFunction().catch(console.error)
  }, [version, address])

  const getTreeForVersion = async (v: number, m: Metadata[]) => {
    const { newLedgerMetadataIPFSHash } = m.find(({ version }) => version == v)
    try {
      const { data } = await axios.get(
        'https://gateway.pinata.cloud/ipfs/' + newLedgerMetadataIPFSHash
      )
      const tree = StandardMerkleTree.load(
        data as StandardMerkleTreeData<any>
      ) as StandardMerkleTree<any>
      return tree
    } catch (e) {
      toast.error("Couldn't retrieve tree data from ipfs")
    }
  }

  const getPastUserClaimsForVersion = async (v: number) => {
    if (!shrine) return []
    const events = await shrine.queryFilter('Claim', 0, 1000) //inefficient
    const pastClaims = events
      .filter(
        (e: Event) =>
          e!.args.champion.toLowerCase() === address?.toLowerCase() &&
          e!.args.version.toNumber() == v
      )
      .map((e) => ({
        champion: e!.args.champion,
        claimedTokenAmount: e!.args.claimedTokenAmount,
        recipient: e!.args.recipient,
        token: e!.args.token,
        version: e!.args.version,
      }))
    return pastClaims
  }

  const getUserClaimForVersion = async (
    v: number,
    t: StandardMerkleTree<any>
  ) => {
    const allClaims = Array.from(t.entries())
    const ownClaim = allClaims.find(([idx, [beneficiaryAddress, shares]]) => {
      return address?.toLowerCase() === beneficiaryAddress.toLowerCase()
    })
    if (!ownClaim) return undefined
    const [index, [beneficiaryAddress, shares]] = ownClaim
    return {
      index,
      address: beneficiaryAddress,
      shares,
    }
  }

  const handleSearch = async () => {
    const isAddress = ethers.utils.isAddress(shrineTextField)
    if (!isAddress) return
    const shrine = new ethers.Contract(
      shrineTextField,
      abi,
      web3Provider?.getSigner()
    )
    try {
      const currentLedgerVersion = await shrine.currentLedgerVersion()
      setShrine(shrine)
      setVersion(currentLedgerVersion.toNumber())
    } catch (e) {
      toast.error('Shrine contract not found')
    }
  }

  const handleClaim = async (index: number, shares: number) => {
    if (!tree || !version) return
    const proof = tree.getProof(index)
    const claimInfo = {
      version,
      token: tokenTextField,
      champion: address,
      shares,
      merkleProof: proof,
    }
    const tx = await shrine?.claim(address, claimInfo)
    tx.wait()
      .then(() => getPastUserClaimsForVersion(version))
      .then((c: PastClaim[]) => setPastUserClaims(c))
  }

  if (!address)
    return (
      <main className="flex h-96 items-center justify-center p-8 text-center">
        <Web3ConnectButton />
      </main>
    )

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
              value={shrineTextField}
              onChange={(e) => setShrineTextField(e.target.value)}
            />
            <button
              className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={handleSearch}
            >
              Search for airdrop
            </button>
          </div>
        ) : (
          <div className="flex w-7/12 min-w-min flex-col p-6 text-left">
            <div className="mb-12 border p-6">
              <div className="mb-6 flex flex-row items-center">
                <span className="mr-8 block text-sm font-medium text-gray-700">
                  Shrine:
                </span>
                <span className="block text-sm font-medium">
                  {shrine.address}
                </span>
              </div>
              <div className="mb-6 flex flex-row items-center justify-between">
                {version && (
                  <LedgerVersions
                    metadatas={metadatas}
                    version={version}
                    setVersion={setVersion}
                  />
                )}
                <div className="flex flex-row">
                  <span className="mr-8 block text-sm font-medium text-gray-700">
                    Shares: {''}
                  </span>
                  <span className="block text-sm font-medium">
                    {userClaim?.shares || 0}
                  </span>
                </div>
              </div>
              <div className="flex flex-row items-center justify-between">
                <div>
                  {' '}
                  <label className="mr-8 text-sm font-medium text-gray-700">
                    Token:
                  </label>
                  <input
                    type="text"
                    className="w-96 rounded-lg border-2 border-gray-300 p-2 text-sm"
                    placeholder="Token Address"
                    value={tokenTextField}
                    onChange={(e) => setTokenTextField(e.target.value)}
                  />
                </div>
                <button
                  className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                  onClick={() =>
                    handleClaim(userClaim?.index, userClaim?.shares)
                  }
                >
                  Claim
                </button>
              </div>
            </div>

            {pastUserClaims && pastUserClaims.length > 0 && (
              <>
                <h2 className="mt-0 mb-2 text-center text-base font-medium">
                  Your past claims:
                </h2>
                <table className="table-auto">
                  <thead>
                    <tr>
                      <th className="text-sm font-medium text-gray-700">
                        Champion
                      </th>
                      <th className="text-sm font-medium text-gray-700">
                        Token
                      </th>
                      <th className="text-sm font-medium text-gray-700">
                        Claimed amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastUserClaims.map((p) => (
                      <tr>
                        <td className="text-sm text-gray-700">
                          {truncateEthAddress(p.champion)}
                        </td>
                        <td className="text-sm text-gray-700">
                          {truncateEthAddress(p.token)}
                        </td>
                        <td className="text-sm text-gray-700">
                          {p.claimedTokenAmount.toString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default Main
