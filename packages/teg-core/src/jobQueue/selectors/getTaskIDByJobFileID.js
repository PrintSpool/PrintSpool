import { createSelector } from 'reselect'

import { spooledTaskStatuses } from '../types/TaskStatusEnum'

const getTaskIDByJobFileID = createSelector(
  state => state.history,
  (history) => {
    const historyByJobFileID = history.groupBy(e => e.jobFileID)

    return historyByJobFileID
      .map((jobFileHistory) => {
        const e = jobFileHistory.first()
        if (spooledTaskStatuses.includes(e.type)) return e.taskID
        return null
      })
  },
)

export default getTaskIDByJobFileID
