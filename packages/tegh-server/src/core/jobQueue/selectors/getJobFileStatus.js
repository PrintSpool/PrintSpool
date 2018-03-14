import { BUBBLING_STATUES } from '../types/JobStatusEnum'
import getTasksFor from '../../spool/selectors/getTasksFor'
import getTasksCompleted from '../../spool/selectors/getTasksCompleted'
import getJobFileTotalTasks from './getJobFileTotalTasks'

const getJobFileStatus = state => ({ jobFileID }) => {
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

export default getJobFileStatus
