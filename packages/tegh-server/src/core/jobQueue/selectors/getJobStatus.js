import { BUBBLING_STATUES, DONE, QUEUED } from '../types/JobStatusEnum'

import getJobFileStatus from './getJobFileStatus'
import getJobFilesFor from './getJobFilesFor'

const getJobStatus = state => ({ jobID }) => {
  const job = state.jobQueue.jobs.get(jobID)
  const jobFiles = getJobFilesFor(state)({ jobID })

  const jobFilesStatues = jobFiles.map((_v, jobFileID) => (
    getJobFileStatus(state)({ jobFileID })
  ))

  const status = jobFilesStatues.find(status =>
    BUBBLING_STATUES.includes(status)
  )

  if (status != null) return status

  const isDone = jobFilesStatues.every(status => status === DONE)

  return isDone ? DONE : QUEUED
}

export default getJobStatus
