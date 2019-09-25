import { createSelector } from 'reselect'

import { spooledTaskStatuses } from '../types/TaskStatusEnum'

const getSpooledJobFiles = createSelector(
  state => state,
  state => (
    state.history
      .groupBy(e => e.jobFileID)
      .filter(jobFileHistory => (
        spooledTaskStatuses.includes(jobFileHistory.last().type)
      ))
      .map((jobFileHistory, jobFileID) => state.jobFiles.get(jobFileID))
      .toList()
  ),
)

export default getSpooledJobFiles
