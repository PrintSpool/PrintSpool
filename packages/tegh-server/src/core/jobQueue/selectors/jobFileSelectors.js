/* these task statuses bubble up through the jobFile to the job */
const BUBBLING_STATUES = ['spooled', 'printing', 'errored', 'cancelled']

export const getJobFileTotalTasks = state => ({ jobFileID }) => {
  const jobFile = state.jobQueue.jobFiles.get(jobFileID)
  const job = state.jobQueue.jobs.get(jobFile.jobID)
  return jobFile.quantity * job.quantity
}

export const getJobFileStatus = state => ({ jobFileID }) => {
  const jobFile = state.jobQueue.jobFiles.get(jobFileID)
  const job = state.jobQueue.jobs.get(jobFile.jobID)

  const tasks = getTasksFor(state)({ taskableID: jobFileID })
  const tasksCompleted = getTasksCompleted(state)({ taskableID: jobFileID })
  const totalTasks = getJobFileTotalTasks(state)({ jobFileID })

  const { status } = tasks.find(task => BUBBLING_STATUES.include(task.status))

  if (status != null) return status

  const isDone = tasksCompleted >= totalTasks
  return isDone ? 'done' : 'queued'
}
