import { createSelector } from 'reselect'

import getJobFilesFor from './getJobFilesFor'

const getJobTotalTasks = createSelector(
  state => ({ jobID }) => {
    const job = state.jobQueue.jobs.get(jobID)
    const jobFiles = getJobFilesFor(state)({ jobID })

    let quantity = 0

    jobFiles.forEach((jobFile) => {
      quantity += jobFile.quantity
    })

    return job.quantity * quantity
  },
)

export default getJobTotalTasks
