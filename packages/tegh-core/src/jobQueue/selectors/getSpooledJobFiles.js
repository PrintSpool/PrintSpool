import { createSelector } from 'reselect'

import { SPOOLED_TYPES } from '../types/JobHistoryTypeEnum'

const getSpooledJobFiles = createSelector(
  state => state,
  state => (
    state.history
      .groupBy(e => e.jobFileID)
      .filter(jobFileHistory => (
        SPOOLED_TYPES.includes(jobFileHistory.first().type)
      ))
      .map((jobFileHistory, jobFileID) => state.jobFiles.get(jobFileID))
      .toList()
  ),
)

export default getSpooledJobFiles
