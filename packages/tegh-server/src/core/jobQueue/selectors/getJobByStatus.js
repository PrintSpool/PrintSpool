import getJobStatus from './getJobStatus'

export const getJobsByStatus = state => ({ statuses }) => {
  return getJobs(state).filter(job => {
    const jobStatus = getJobStatus(state)({ jobID: job.id })
    return statues.includes(jobStatus)
  })
}
