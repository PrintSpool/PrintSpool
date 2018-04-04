import getJobs from './getJobs'
import getJobStatus from './getJobStatus'

const getJobsByStatus = state => ({ statuses }) => {
  return getJobs(state)
    .filter(job => {
      const jobStatus = getJobStatus(state)({ jobID: job.id })
      return statuses.includes(jobStatus)
    })
    .values()
}

export default getJobsByStatus
