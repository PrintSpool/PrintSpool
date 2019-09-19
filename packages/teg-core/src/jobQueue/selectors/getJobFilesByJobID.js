import { createSelector } from 'reselect'

const getJobFilesByJobID = createSelector(
  state => state.jobFiles,
  jobFiles => (
    jobFiles
      .toList()
      .groupBy(jobFile => jobFile.jobID)
  ),
)

export default getJobFilesByJobID
