import { createSelector } from 'reselect'

const getJobFileTotalTasks = createSelector(
  state => ({ jobFileID }) => {
    const jobFile = state.jobFiles.get(jobFileID)
    const job = state.jobs.get(jobFile.jobID)
    return jobFile.quantity * job.quantity
  },
)

export default getJobFileTotalTasks
