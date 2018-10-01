import { createSelector } from 'reselect'

import getJobFilesByJobID from './getJobFilesByJobID'
import { FINISH_PRINT } from '../types/JobHistoryTypeEnum'

const getCompletedJobs = createSelector(
  (state) => {
    const historyByJobID = state.history.groupBy(e => e.jobID)
    const jobFilesByJobID = getJobFilesByJobID(state)

    return state.jobs.filter((job) => {
      const finishedPrintsByJobFileID = historyByJobID.get(job.id)
        .filter(e => e.type === FINISH_PRINT)
        .countBy(e => e.jobFileID)

      const unfinishedFile = jobFilesByJobID.get(job).find(jobFile => (
        jobFile.quantity * job.quantity
        - finishedPrintsByJobFileID.get(jobFile.id)
      ))

      return unfinishedFile == null
    })
  },
)

export default getCompletedJobs
