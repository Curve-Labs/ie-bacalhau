import React, { useState, useEffect } from 'react'
import { EthereumAuthProvider, useViewerConnection } from '@self.id/framework'
import { useWeb3Context } from '../context'

const loadingContributions = 'loading_contributions'

const contribute = () => {
  const [connection, connect] = useViewerConnection()
  const [selfId, setSelfId] = useState(null)
  const { address, provider } = useWeb3Context()
  const [hoursTextField, setHoursTextField] = useState('')
  const [daoTextField, setDaoTextField] = useState('')
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(null)

  useEffect(() => {
    const asyncFunction = async () => {
      // authenticate
      const selfId = await connect(new EthereumAuthProvider(provider, address))
      const { id, client, set } = selfId
      const { dataStore, ceramic, dataModel } = client
      await ceramic.did.authenticate()

      const newContribution = await dataModel.createTile('Contribution', {
        daoId: 'kiki',
        hoursPerWeek: 4220,
      })

      const result = await dataStore.get('contributions')
      console.log(result)
      const contributionsRecord = result.contributions ?? []
      const newRecord = {
        contributions: [
          ...contributionsRecord,
          { id: newContribution.id.toUrl(), title: 'week3' },
        ],
      }
      await dataStore.set('contributions', newRecord)

      setSelfId(selfId)
      setContributions(await dataStore.get('contributions'))
    }

    setLoading('loading_contributions')
    asyncFunction()
      .then(() => {
        setLoading(null)
      })
      .catch(console.log)
  }, [provider])

  const handleContributionSubmission = () => {}

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
