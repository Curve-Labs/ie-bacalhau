import React, { useState, useEffect } from 'react'
import { EthereumAuthProvider, useViewerConnection } from '@self.id/framework'
import { useWeb3Context } from '../context'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import truncateEthAddress from 'truncate-eth-address'

const loadingContributions = 'loading_contributions'
const loadingAuthenticating = 'loading_authenticating'
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

      setSelfId(selfId)
      return selfId
    }

    authenticate()
      .then((selfId) => {
        return fetchContributions(selfId.client.dataStore)
      })
      .catch(console.log)
  }, [provider])

  const fetchContributions = async (dataStore) => {
    // const newRecord = {
    //   contributions: [],
    // }
    // await dataStore.set('contributions', newRecord)
    console.log(await dataStore.get('contributions'))
    const { contributions: contributionsRecord } = await dataStore.get(
      'contributions'
    )

    console.log(contributionsRecord)

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
    console.log(parsedContributions)

    setContributions(parsedContributions)
  }

  const addContribution = async (
    client,
    newContribution,
    contributionId,
    currentContributions
  ) => {
    console.log(newContribution)
    const { dataModel, dataStore } = client
    const newContributionTile = await dataModel.createTile(
      'Contribution',
      newContribution
    )

    const newRecord = {
      contributions: [
        ...(await dataStore.get('contributions')).contributions,
        { id: newContributionTile.id.toUrl(), title: contributionId },
      ],
    }
    console.log(newRecord)
    await dataStore.set('contributions', newRecord)
  }

  const handleContributionSubmission = async () => {
    if (!contributionIdTextField || !hoursTextField)
      return toast.error('All textfields must be filled')

    setLoading(loadingSendContribution)
    await addContribution(
      selfId.client,
      {
        daoId: daoAddress,
        hoursPerWeek: parseInt(hoursTextField),
      },
      contributionIdTextField,
      contributions
    )
    await fetchContributions(selfId.client.dataStore)
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

  if (daoAddress && contributions) {
    console.log(contributions)
    console.log(getDaoContributions(contributions))
  }
  if (!selfId) {
    return <div>Log into Ceramic by signing the message in your wallet</div>
  }

  return (
    <div>
      <div>Contribute</div>
      {loading === loadingContributions && <p>Loading contributions</p>}
      {loading === loadingAuthenticating && <p>Authenticating</p>}
      {loading === loadingSendContribution && <p>Submitting contribution</p>}
      {!daoAddress ? (
        <>
          <div>
            <input
              type="text"
              className="mb-4 block w-full rounded-lg border-2 border-gray-300 p-2"
              placeholder="DAO address"
              value={daoTextField}
              onChange={(e) => setDaoTextField(e.target.value)}
            />
          </div>
          <button
            className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
            onClick={handleDaoSubmission}
          >
            Set DAO
          </button>
        </>
      ) : (
        <>
          <input
            type="number"
            className="mb-4 block w-full rounded-lg border-2 border-gray-300 p-2"
            placeholder="Hours"
            value={hoursTextField}
            onChange={(e) => setHoursTextField(e.target.value)}
          />
          <input
            type="text"
            className="mb-4 block w-full rounded-lg border-2 border-gray-300 p-2"
            placeholder="Contribution Identifier"
            value={contributionIdTextField}
            onChange={(e) => setContributionIdTextField(e.target.value)}
          />
          <button
            className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
            onClick={handleContributionSubmission}
          >
            Add Contribution
          </button>
          <table className="table-auto">
            <thead>
              <tr>
                <th className="text-sm font-medium text-gray-700">DAO</th>
                <th className="text-sm font-medium text-gray-700">Title</th>
                <th className="text-sm font-medium text-gray-700">Hours</th>
                <th className="text-sm font-medium text-gray-700">Commit ID</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((c) => (
                <tr key={c.commitId}>
                  <td className="text-sm text-gray-700">
                    {truncateEthAddress(c.daoId)}
                  </td>
                  <td className="text-sm text-gray-700">{c.title}</td>
                  <td className="text-sm text-gray-700">{c.metric}</td>
                  <td className="text-sm text-gray-700">{c.commitId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default contribute
