import { BUBBLING_STATUES, DONE, QUEUED } from '../types/JobStatusEnum'

import getJobFileStatus from './getJobFileStatus'
import getJobFilesFor from './getJobFilesFor'

const getJobStatus = state => ({ jobID }) => {
  const job = state.jobQueue.jobs.get(jobID)
  const jobFiles = getJobFilesFor(state)({ jobID })

  const jobFilesStatuses = jobFiles.map((jobFile) => (
    getJobFileStatus(state)({ jobFileID: jobFile.id })
  ))

  const status = jobFilesStatuses.find(status =>
    BUBBLING_STATUES.includes(status)
  )

  if (status != null) return status

  const isDone = jobFilesStatuses.every(status => status === DONE)

  return isDone ? DONE : QUEUED
}

export default getJobStatus
