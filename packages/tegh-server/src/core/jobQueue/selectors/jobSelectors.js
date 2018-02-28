
/* these task statuses bubble up through the jobFile to the job */
const BUBBLING_STATUES = ['spooled', 'printing', 'errored', 'cancelled']

export const getJobs = state => {
  return state.jobQueue.jobs
}

export const getJobsByStatus = state => ({ statuses }) => {
  return getJobs(state).filter(job => {
    const jobStatus = getJobStatus(state)({ jobID: job.id })
    return statues.includes(jobStatus)
  })
}

export const getJobFilesFor = state => ({ jobID }) => {
  const { jobFiles } = state.jobQueue
  return jobFiles.filter(jobFile => jobFile.jobID === jobID)
}

export const getJobStatus = state => ({ jobID }) => {
  const job = state.jobQueue.jobs.get(jobID)
  const quantityCompleted = getJobQuantityCompleted(state)({ jobID })

  const jobFilesStatues = jobFiles.map((_v, jobFileID) => (
    getJobFileStatus(state)({ jobFileID })
  ))

  const status = jobFilesStatues.find(status => BUBBLING_STATUES.includes(status))

  if (status != null) return status

  const isDone = jobFilesStatues.every(status => status === 'done')
  return isDone ? 'done' : 'queued'
}
