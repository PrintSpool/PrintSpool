const getJobFilesFor = state => ({ jobID }) => {
  const { jobFiles } = state.jobQueue
  return jobFiles.filter(jobFile => jobFile.jobID === jobID)
}

export default getJobFilesFor
