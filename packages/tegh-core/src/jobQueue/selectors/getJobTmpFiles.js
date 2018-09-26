import { createSelector } from 'reselect'

const getJobTmpFilePaths = createSelector(
  state => ({ jobID }) => (
    state.jobFiles
      .filter(jobFile => jobFile.jobID === jobID && jobFile.isTmpFile === true)
      .map(jobFile => jobFile.filePath)
  ),
)

export default getJobTmpFilePaths
