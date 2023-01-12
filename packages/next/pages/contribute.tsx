import React, { useState, useEffect } from 'react'
import {
  EthereumAuthProvider,
  useViewerConnection,
  SelfID,
} from '@self.id/framework'
import { WebClient } from '@self.id/web'
import { useWeb3Context } from '../context'

const loadingContributions = 'loading_contributions'
const loadingAuthenticating = 'loading_authenticating'

const contribute = () => {
  const [connection, connect] = useViewerConnection()
  const [selfId, setSelfId] = useState(null)
  const { address, provider } = useWeb3Context()
  const [hoursTextField, setHoursTextField] = useState('')
  const [daoTextField, setDaoTextField] = useState('')
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

    const fetchContributions = async (selfId: SelfID) => {
      const { client } = selfId
      const contributionsRecord = await getContributions(client.dataStore)
      await addContribution(
        client,
        {
          daoId: 'kiki',
          hoursPerWeek: 4220,
        },
        contributionsRecord
      )
      setContributions(await getContributions(selfId))
    }

    authenticate()
      .then((selfId) => {
        return fetchContributions(selfId)
      })
      .catch(console.log)
  }, [provider])

  const getContributions = async (dataStore) => {
    const { contributions } = await dataStore.get('contributions')
    return contributions
  }

  const addContribution = async (
    client,
    newContribution,
    currentContributions
  ) => {
    const { dataModel, dataStore } = client
    const newContributionTile = await dataModel.createTile(
      'Contribution',
      newContribution
    )
    const contributionsRecord = currentContributions ?? []
    const newRecord = {
      contributions: [
        ...contributionsRecord,
        { id: newContributionTile.id.toUrl(), title: 'week3' },
      ],
    }
    await dataStore.set('contributions', newRecord)
  }

  const handleContributionSubmission = () => {}

  console.log(selfId)
  console.log(contributions)

  return (
    <div>
      <div>Contribute</div>
      {loading === loadingContributions && <p>Loading contributions</p>}
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
        placeholder="DAO address"
        value={daoTextField}
        onChange={(e) => setDaoTextField(e.target.value)}
      />
      <button
        className="rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
        onClick={handleContributionSubmission}
      >
        Add Contribution
      </button>
    </div>
  )
}

export default contribute
