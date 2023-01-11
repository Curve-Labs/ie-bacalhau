import React, { useState } from 'react'

const contribute = () => {
  const [hoursTextField, setHoursTextField] = useState('')
  const [daoTextField, setDaoTextField] = useState('')

  const handleContributionSubmission = () => {
    console.log('hi')
  }

  // todo get current week number
  const weekNumber = 2

  return (
    <div>
      <div>Contribute</div>
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
