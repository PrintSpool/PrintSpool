import { createSelector } from 'reselect'

import {
  FINISH_TASK,
} from '../types/TaskStatusEnum'

const getCompletedJobs = createSelector(
  state => state,
  state => state.history,
  (state, history) => {
    const printsStarted = history
      .groupBy(event => event.jobFileID)
      // get the number of prints started and not cancelled or errored
      .map(h => h.count(event => (event.type === FINISH_TASK ? 1 : 0)))

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
