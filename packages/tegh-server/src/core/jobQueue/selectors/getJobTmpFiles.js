const getJobTmpFilePaths = state => ({ jobID }) => {
  return state.jobFiles
    .filter(jobFile => jobFile.jobID === jobID && jobFile.isTmpFile === true)
    .map(jobFile => jobFile.filePath)
}

export default getJobTmpFilePaths
