import { createSelector } from 'reselect'

import { SPOOLED_TYPES } from '../types/JobHistoryTypeEnum'

const getTaskIDByJobFileID = createSelector(
  state => state.history,
  (history) => {
    const historyByJobFileID = history.groupBy(e => e.jobFileID)

    return historyByJobFileID
      .map((jobFileHistory) => {
        const e = jobFileHistory.first()
        if (SPOOLED_TYPES.includes(e.type)) return e.taskID
        return null
      })
  },
)

export default getTaskIDByJobFileID
