import { createSelector } from 'reselect'

import { SPOOLED_TYPES } from '../types/JobHistoryTypeEnum'

const getSpooledJobFiles = createSelector(
  (state) => {
    const historyByJobID = state.history.groupBy(e => e.jobID)
    return state.jobFiles
      .toList()
      .filter(jobFile => (
        SPOOLED_TYPES.include(historyByJobID.get(jobFile.jobID).type)
      ))
  },
)

export default getSpooledJobFiles
