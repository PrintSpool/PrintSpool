import Job from '../types/Job'
import Task from '../../spool/types/Task'
import { getTasksCompleted } from '../../spool/reducers/spoolReducer'

/* these task statuses bubble up through the jobFile to the job */
const BUBBLING_STATUES = ['spooled', 'printing', 'errored', 'cancelled']

/* jobFile selectors */

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

/* job selectors */

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

/* reducer */

const initialState = Record({
  jobs: Map(),
  jobFiles: Map(),
})()

const jobQueue = (state = initialState, action) => {
  switch(action.type) {
    case CREATE_JOB: {
      const { job, jobFiles } = action.payload
      return state
        .setIn(['jobs', job.id], job))
        .mergeIn(['jobFiles'], jobFiles)
    }
    case DELETE_JOB: {
      const { jobID } = action.payload
      return state
        .deleteIn(['jobs', jobID])
        .updateIn(['jobFiles'], jobFiles => (
          jobFiles.filter(file => file.jobID !== jobID)
        ))
    }
    default: {
      return state
    }
  }
}

export default jobQueue
