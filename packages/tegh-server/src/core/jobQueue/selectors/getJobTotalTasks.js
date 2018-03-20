import getJobFilesFor from './getJobFilesFor'

const getJobTotalTasks = state => ({ jobID }) => {
  const job = state.jobQueue.jobs.get(jobID)
  const jobFiles = getJobFilesFor(state)({ jobID })

  let quantity = 0

  jobFiles.forEach(jobFile => quantity = quantity + jobFile.quantity)
  return job.quantity * quantity
}

export default getJobTotalTasks
