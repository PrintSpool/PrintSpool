import { BUBBLING_STATUES } from '../types/JobStatusEnum'

import getJobQuantityCompleted from './getJobQuantityCompleted'
import getJobFileStatus from './getJobFileStatus'

export const getJobStatus = state => ({ jobID }) => {
  const job = state.jobQueue.jobs.get(jobID)
  const quantityCompleted = getJobQuantityCompleted(state)({ jobID })

  const jobFilesStatues = jobFiles.map((_v, jobFileID) => (
    getJobFileStatus(state)({ jobFileID })
  ))

  const status = jobFilesStatues.find(status =>
    BUBBLING_STATUES.includes(status)
  )

  if (status != null) return status

  const isDone = jobFilesStatues.every(status => status === 'done')

  return isDone ? 'done' : 'queued'
}
