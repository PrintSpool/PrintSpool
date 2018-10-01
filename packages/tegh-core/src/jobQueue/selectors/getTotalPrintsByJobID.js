import { createSelector } from 'reselect'

import getJobFilesByJobID from './getJobFilesByJobID'

const getTotalPrintsByJobID = createSelector(
  (state) => {
    const jobFilesByJobID = getJobFilesByJobID(state)
    return state.jobs.map((job) => {
      const jobFiles = jobFilesByJobID.get(job.id)
      return job.quantity * jobFiles.count(jobFile => jobFile.quantity)
    })
  },
)

export default getTotalPrintsByJobID
