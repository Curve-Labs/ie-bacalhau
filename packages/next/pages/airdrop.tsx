import { useEffect, useState } from 'react'
import { useViewerConnection, EthereumAuthProvider } from '@self.id/framework'
import type { NextPage } from 'next'
import { useWeb3Context } from '../context'
import { toast } from 'react-toastify'
import { ethers } from 'ethers'
import axios from 'axios'
import { Web3ConnectButton } from '../components'

const Airdrop: NextPage = () => {
  const [connection, connect] = useViewerConnection()
  const { address, provider, web3Provider, network } = useWeb3Context()
  const [selfId, setSelfId] = useState(null)
  const [daoTextField, setDaoTextField] = useState('')
  const [contributionIdTextField, setContributionIdTextField] = useState('')
  const [addressesTextField, setAddressesTextField] = useState('')
  const [contributionSpecification, setContributionSpecification] =
    useState(null)
  const [loading, setLoading] = useState(null)
  const [contributions, setContributions] = useState([])
  const [contributorAddresses, setContributorAddresses] = useState([])
  const [ipfs, setIpfs] = useState(null)

  useEffect(() => {
    if (!provider) return

    const authenticate = async () => {
      const selfId = await connect(new EthereumAuthProvider(provider, address))
      const {
        client: { ceramic },
      } = selfId
      await ceramic.did.authenticate()
      toast.success('Authenticated with Ceramic')
      setSelfId(selfId)
      return selfId
    }

    authenticate().catch(console.log)
  }, [address])

  const handleSpecifyContribution = () => {
    const isAddress = ethers.utils.isAddress(daoTextField)
    if (!isAddress) toast.error('No valid dao address')

    setContributionSpecification({
      daoId: daoTextField,
      contributionId: contributionIdTextField,
    })
  }

  const handleContributorAddresses = async () => {
    setLoading('loading_contributions')
    const {
      client: { dataStore },
    } = selfId
    const addressesArray = Array.from(
      new Set(addressesTextField.split(',').map((s) => s.trim()))
    )
    const didPrefix = `did:pkh:eip155:${network.chainId}:`
    const dids = addressesArray.map((address) => didPrefix + address)
    const rawContributionPromises = await Promise.allSettled(
      dids.map((did) => dataStore.get('contributions', did))
    )
    const flattenedContributions = rawContributionPromises
      .map((p) => (p.status === 'fulfilled' ? p.value : null))
      .filter((c) => c)
      .map(({ contributions }) => {
        return contributions
      })
      .flat()
    const parsedContributions = (
      await Promise.all(
        flattenedContributions.map((c) => {
          return dataStore.loader
            .load(c.id)
            .then((tileDocument) => {
              return {
                contributionMetric: tileDocument.content.contributionMetric,
                daoId: tileDocument.content.daoId,
                commitId: tileDocument.commitId.toUrl(),
                contributionId: tileDocument.content.contributionId,
                contributor: tileDocument.metadata.controllers[0].substr(
                  tileDocument.metadata.controllers[0].length - 42
                ),
                timestamp: tileDocument.state.anchorProof.blockTimestamp,
              }
            })
            .catch((e) => {
              console.log(e)
              return null
            })
        })
      )
    ).filter((c) => c)

    const perDaoAndContIdConts = parsedContributions.filter(
      (c) =>
        c.daoId.toLowerCase() ===
          contributionSpecification.daoId.toLowerCase() &&
        c.contributionId === contributionSpecification.contributionId
    )

    // if a contributor has two contributions with same contribution id, we take the one that was submitted last
    const onlyMostRecentConts = perDaoAndContIdConts.reduce((arr, tile) => {
      const dupIdx = arr.findIndex((t) => {
        return t.contributor === tile.contributor
      })
      if (dupIdx === -1) {
        arr.push(tile)
        return arr
      }

      if (tile.timestamp > arr[dupIdx].timestamp) {
        arr[dupIdx] = tile
      }

      return arr
    }, [])
    setLoading(null)
    setContributions(onlyMostRecentConts)
    setContributorAddresses(addressesArray)
  }

  const handleIpfsUpload = async () => {
    setLoading('loading_ipfs')

    const contributionsObj = {}
    for (let i = 0; i < contributions.length; i++) {
      contributionsObj[contributions[i].contributor] = parseInt(
        contributions[i].contributionMetric
      )
    }

    const httpConfig = {
      headers: {
        pinata_api_key: process.env.pinataApiKey,
        pinata_secret_api_key: process.env.pinataApiSecret,
      },
    }

    try {
      const {
        data: { IpfsHash: contributionsIpfsHash },
      } = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        { data: contributionsObj },
        httpConfig
      )
      const {
        data: { IpfsHash: addressesIpfsHash },
      } = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        contributorAddresses,
        httpConfig
      )
      toast.success('successfully uploaded to ipfs')
      setIpfs({ contributionsIpfsHash, addressesIpfsHash })
    } catch (e) {
      console.log(e)
      toast.error('error uploading to ipfs')
    }

    setLoading(null)
  }

  if (!address)
    return (
      <main className="flex h-96 items-center justify-center p-8 text-center">
        <Web3ConnectButton />
      </main>
    )

  if (!selfId) {
    return (
      <main className="grow p-8 text-center">
        <div>
          Authenticate with Ceramic by signing the message in your wallet
        </div>
      </main>
    )
  }

  return (
    <main className="grow p-8 text-center">
      <div className="flex flex-col items-center justify-center">
        {!contributionSpecification && (
          <div className="mb-6 flex w-7/12 min-w-min flex-col p-6 text-left">
            <div className="p-6 shadow-md sm:rounded-lg">
              <label
                className="mr-8 text-sm font-medium text-gray-700"
                htmlFor="dao-id"
              >
                Contributor addresses:
              </label>
              <textarea
                id="message"
                rows="10"
                className="mb-4 block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="address1, address2, address3"
                value={addressesTextField}
                onChange={(e) => setAddressesTextField(e.target.value)}
              ></textarea>
              <div className="flex flex-row justify-end">
                <button
                  onClick={handleContributorAddresses}
                  className={
                    loading === 'loading_contributions'
                      ? 'cursor-not-allowed rounded-lg bg-blue-300 py-2 px-4 font-bold text-white'
                      : 'rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700'
                  }
                  disabled={loading === 'loading_send_contribution'}
                >
                  {loading === 'loading_contributions'
                    ? 'loading contributions..'
                    : 'Get contributions'}
                </button>
              </div>
            </div>
          </div>
        )}
        {contributionSpecification && contributorAddresses.length === 0 && (
          <div className="mb-6 flex w-7/12 min-w-min flex-col p-6 text-left">
            <div className="p-6 shadow-md sm:rounded-lg">
              <label
                className="mr-8 text-sm font-medium text-gray-700"
                htmlFor="dao-id"
              >
                Contributor addresses:
              </label>
              <textarea
                id="message"
                rows="10"
                className="mb-4 block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="address1, address2, address3"
                value={addressesTextField}
                onChange={(e) => setAddressesTextField(e.target.value)}
              ></textarea>
              <div className="flex flex-row justify-end">
                <button
                  onClick={handleContributorAddresses}
                  className={
                    loading === 'loading_contributions'
                      ? 'cursor-not-allowed rounded-lg bg-blue-300 py-2 px-4 font-bold text-white'
                      : 'rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700'
                  }
                  disabled={loading === 'loading_send_contribution'}
                >
                  {loading === 'loading_contributions'
                    ? 'loading contributions..'
                    : 'Get contributions'}
                </button>
              </div>
            </div>
          </div>
        )}
        {contributionSpecification && contributorAddresses.length > 0 && (
          <div className="mb-12 flex w-7/12 min-w-min flex-col p-6 text-left">
            <div className="p-6 shadow-md sm:rounded-lg">
              <div className="flex flex-row items-center justify-between p-2">
                <span className="mr-8 block text-sm font-medium text-gray-700">
                  DAO:
                </span>
                <span className="block text-sm font-medium">
                  {contributionSpecification.daoId}
                </span>
              </div>
              <div className="flex flex-row items-center justify-between p-2">
                <span className="mr-8 block text-sm font-medium text-gray-700">
                  Contribution ID:
                </span>
                <span className="block text-sm font-medium">
                  {contributionSpecification.contributionId}
                </span>
              </div>
              <div className="flex flex-row items-center justify-between p-2">
                <div className="mr-8 block  text-sm font-medium text-gray-700">
                  Contributor Addresses:
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {contributorAddresses.map((address) => (
                    <div>{address}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {contributionSpecification && contributions.length > 0 && (
          <div className="mb-12">
            <div className="relative mb-6 overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Contribution Metric
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Contributor
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((c) => (
                    <tr className="border-b bg-white" key={c.commitId}>
                      <td className="px-6 py-4">{c.contributionMetric}</td>
                      <td className="px-6 py-4">{c.contributor}</td>
                      <td className="px-6 py-4">
                        <p
                          onClick={() => {
                            navigator.clipboard.writeText(c.commitId)
                          }}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Copy Commit ID
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-row justify-end">
              <button
                onClick={handleIpfsUpload}
                className={
                  loading === 'loading_ipfs'
                    ? 'cursor-not-allowed rounded-lg bg-blue-300 py-2 px-4 font-bold text-white'
                    : 'rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700'
                }
                disabled={loading === 'loading_send_contribution'}
              >
                {loading === 'loading_ipfs'
                  ? 'uploading to ipfs..'
                  : 'Upload to IPFS'}
              </button>
            </div>
          </div>
        )}
        {ipfs && (
          <div className="relative mb-6 overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Ipfs Hash
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-white">
                  <td className="px-6 py-4">Trusted Seed</td>
                  <td className="px-6 py-4">{ipfs.addressesIpfsHash}</td>
                </tr>
                <tr className="border-b bg-white">
                  <td className="px-6 py-4">Contributions Data</td>
                  <td className="px-6 py-4">{ipfs.contributionsIpfsHash}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

export default Airdrop
