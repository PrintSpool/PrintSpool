import { createSelector } from 'reselect'

const getJobFilesFor = createSelector(
  state => ({ jobID }) => (
    state.jobFiles
      .filter(jobFile => jobFile.jobID === jobID)
      .toList()
  ),
)

export default getJobFilesFor
