import { createSelector } from 'reselect'

import getJobs from './getJobs'
import getJobStatus from './getJobStatus'

const getJobsByStatus = createSelector(
  state => ({ statuses }) => (
    getJobs(state)
      .filter((job) => {
        const jobStatus = getJobStatus(state)({ jobID: job.id })
        return statuses.includes(jobStatus)
      })
      .values()
  ),
)

export default getJobsByStatus
