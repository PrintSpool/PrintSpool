import { BUBBLING_STATUES, DONE, QUEUED } from '../types/JobStatusEnum'

import getJobFileStatus from './getJobFileStatus'
import getJobFilesFor from './getJobFilesFor'

const getJobStatus = state => ({ jobID }) => {
  const jobFiles = getJobFilesFor(state)({ jobID })

  const jobFilesStatuses = jobFiles.map(jobFile => (
    getJobFileStatus(state)({ jobFileID: jobFile.id })
  ))

  const status = jobFilesStatuses.find(jobFileStatus => (
    BUBBLING_STATUES.includes(jobFileStatus)
  ))

  if (status != null) return status

  const isDone = jobFilesStatuses.every(jobFileStatus => jobFileStatus === DONE)

  return isDone ? DONE : QUEUED
}

export default getJobStatus
