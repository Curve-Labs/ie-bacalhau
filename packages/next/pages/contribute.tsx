import React, { useState, useEffect } from 'react'
import { EthereumAuthProvider, useViewerConnection } from '@self.id/framework'
import { useWeb3Context } from '../context'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import { Web3ConnectButton } from '../components'

const loadingSendContribution = 'loading_send_contribution'

const contribute = () => {
  const [connection, connect] = useViewerConnection()
  const [selfId, setSelfId] = useState(null)
  const { address, provider } = useWeb3Context()
  const [hoursTextField, setHoursTextField] = useState('')
  const [daoTextField, setDaoTextField] = useState('')
  const [contributionIdTextField, setContributionIdTextField] = useState('')
  const [daoAddress, setDaoAddress] = useState(null)
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(null)

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

    authenticate()
      .then((selfId) => {
        return fetchContributions(selfId.client.dataStore)
      })
      .catch(console.log)
  }, [address])

  const fetchContributions = async (dataStore) => {
    const response = await dataStore.get('contributions')
    const contributionsRecord = response ? response.contributions : []
    const parsedContributions = (
      await Promise.all(
        contributionsRecord.map((c) => {
          return dataStore.loader
            .load(c.id)
            .then((tileDocument) => ({
              metric: tileDocument.content.hoursPerWeek,
              daoId: tileDocument.content.daoId,
              commitId: tileDocument.commitId.toUrl(),
              title: c.title,
            }))
            .catch(() => null)
        })
      )
    ).filter((c) => c)

    setContributions(parsedContributions)
  }

  const addContribution = async (client, newContribution, contributionId) => {
    const { dataModel, dataStore } = client
    const newContributionTile = await dataModel.createTile(
      'Contribution',
      newContribution
    )

    const existingContributions = await dataStore.get('contributions')
    const oldRecord = existingContributions
      ? existingContributions.contributions
      : []
    const newRecord = {
      contributions: [
        ...oldRecord,
        { id: newContributionTile.id.toUrl(), title: contributionId },
      ],
    }
    await dataStore.set('contributions', newRecord)
  }

  const handleContributionSubmission = async () => {
    if (!contributionIdTextField || !hoursTextField)
      return toast.error('All textfields must be filled')

    setLoading(loadingSendContribution)
    try {
      await addContribution(
        selfId.client,
        {
          daoId: daoAddress,
          hoursPerWeek: parseInt(hoursTextField),
        },
        contributionIdTextField
      )
      await fetchContributions(selfId.client.dataStore)
      toast.success('submitted contribution')
    } catch (e) {
      toast.error('failure when submitting contribution')
    }
    setLoading(null)
  }

  const handleDaoSubmission = async () => {
    if (!ethers.utils.isAddress(daoTextField)) {
      toast.error('Not a valid Ethereum address')
      return
    }
    setDaoAddress(daoTextField)
  }

  const getDaoContributions = (contributions) =>
    contributions.filter((contribution) => {
      return contribution.daoId.toLowerCase() === daoAddress.toLowerCase()
    })

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
      <div className="mb-6">
        <h1 className="pb-8 text-4xl font-bold">Contribute</h1>
        <h2 className="mt-0 mb-2 text-base font-medium">
          Manage your DAO contributions!
        </h2>
      </div>
      <div className="flex flex-col items-center justify-center">
        {!daoAddress ? (
          <div className="flex w-7/12 flex-col items-center p-6">
            <p className="mb-2 text-base">
              Enter the address of the DAO that you contributed to.
            </p>
            <input
              type="text"
              className="mb-4 block w-full rounded-lg border-2 border-gray-300 p-2"
              placeholder="DAO address"
              value={daoTextField}
              onChange={(e) => setDaoTextField(e.target.value)}
            />
            <button
              className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={handleDaoSubmission}
            >
              Set DAO
            </button>
          </div>
        ) : (
          <div className="mb-12 flex w-7/12 min-w-min flex-col p-6 text-left">
            <div className="mb-12 p-6 shadow-md sm:rounded-lg">
              <div>
                <label
                  className="mr-8 text-sm font-medium text-gray-700"
                  htmlFor="contribution-metric"
                >
                  Contribution metric:
                </label>
                <input
                  id="contribution-metric"
                  type="number"
                  className="mb-4 block w-full rounded-lg border-2 border-gray-300 p-2"
                  placeholder="Metric"
                  value={hoursTextField}
                  onChange={(e) => setHoursTextField(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="mr-8 text-sm font-medium text-gray-700"
                  htmlFor="contribution-id"
                >
                  Contribution Identifier:
                </label>
                <input
                  id="contribution-id"
                  type="text"
                  className="mb-4 block w-full rounded-lg border-2 border-gray-300 p-2"
                  placeholder="Contribution ID"
                  value={contributionIdTextField}
                  onChange={(e) => setContributionIdTextField(e.target.value)}
                />
              </div>
              <div className="flex flex-row justify-end">
                <button
                  className={
                    loading === 'loading_send_contribution'
                      ? 'cursor-not-allowed rounded-lg bg-blue-300 py-2 px-4 font-bold text-white'
                      : 'rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700'
                  }
                  onClick={handleContributionSubmission}
                  disabled={loading === 'loading_send_contribution'}
                >
                  {loading === 'loading_send_contribution'
                    ? 'submitting contribution'
                    : 'Add Contribution'}
                </button>
              </div>
            </div>
            <h2 className="mt-0 mb-2 text-center text-base font-medium">
              {'Your past contributions for DAO ' + daoAddress}
            </h2>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Contribution ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Contribution Metric
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getDaoContributions(contributions).map((c) => (
                    <tr className="border-b bg-white" key={c.commitId}>
                      <td className="px-6 py-4">{c.title}</td>
                      <td className="px-6 py-4">{c.metric}</td>
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
          </div>
        )}
      </div>
    </main>
  )
}

export default contribute
