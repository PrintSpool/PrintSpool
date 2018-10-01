import { createSelector } from 'reselect'

import { SPOOLED_TYPES } from '../types/JobHistoryTypeEnum'

const getTaskIDByJobFileID = createSelector(
  (state) => {
    const historyByJobFileID = state.history.groupBy(e => e.jobFileID)

    return historyByJobFileID
      .map((history) => {
        const e = history.first()
        if (SPOOLED_TYPES.include(e.type)) return e.taskID
        return null
      })
  },
)

export default getTaskIDByJobFileID
