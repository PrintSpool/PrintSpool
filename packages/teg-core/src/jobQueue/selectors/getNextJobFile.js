import { createSelector } from 'reselect'

import {
  START_PRINT,
  CANCEL_PRINT,
  PRINT_ERROR,
} from '../types/JobHistoryTypeEnum'

const getCompletedJobs = createSelector(
  state => state,
  state => state.history,
  (state, history) => {
    const printsStarted = history
      .groupBy(event => event.jobFileID)
      // get the number of prints started and not cancelled or errored
      .map(h => h.count((event) => {
        switch (event.type) {
          case START_PRINT: {
            return 1
          }
          case CANCEL_PRINT:
          case PRINT_ERROR: {
            return -1
          }
          default: {
            return 0
          }
        }
      }))

    const result = state.jobFiles
      // map job files with unfufilled prints remaining to true
      .map((jobFile, id) => {
        const job = state.jobs.get(jobFile.jobID)
        const total = jobFile.quantity * job.quantity
        return {
          job,
          jobFile,
          unfufilled: printsStarted.get(id, 0) < total,
        }
      })
      .filter(({ unfufilled }) => unfufilled)
      // get the first unfufilled jobFile sorted by job queue order
      .minBy(({ job }) => job.id)

    if (result == null) return null

    const { jobFile: nextJobFile } = result
    return nextJobFile
  },
)

export default getCompletedJobs
