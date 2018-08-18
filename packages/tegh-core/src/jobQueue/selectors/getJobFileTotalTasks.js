import getTasksFor from '../../spool/selectors/getTasksFor'

const getJobFileTotalTasks = state => ({ jobFileID }) => {
  const jobFile = state.jobQueue.jobFiles.get(jobFileID)
  const job = state.jobQueue.jobs.get(jobFile.jobID)
  return jobFile.quantity * job.quantity
}

export default getJobFileTotalTasks
