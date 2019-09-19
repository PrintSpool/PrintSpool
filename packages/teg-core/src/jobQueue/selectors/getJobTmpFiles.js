import { createSelector } from 'reselect'

const getJobTmpFilePaths = createSelector(
  state => state,
  state => ({ jobID }) => (
    state.jobFiles
      .filter(jobFile => jobFile.jobID === jobID && jobFile.isTmpFile === true)
      .map(jobFile => jobFile.filePath)
      .toList()
  ),
)

export default getJobTmpFilePaths
