import { createSelector } from 'reselect'

const getTotalPrintsByJobFileID = createSelector(
  state => state,
  state => (
    state.jobFiles.map((jobFile) => {
      const job = state.jobs.get(jobFile.jobID)
      return job.quantity * jobFile.quantity
    })
  ),
)

export default getTotalPrintsByJobFileID
