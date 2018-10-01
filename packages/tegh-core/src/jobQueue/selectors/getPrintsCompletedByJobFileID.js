import { createSelector } from 'reselect'

import { FINISH_PRINT } from '../types/JobHistoryTypeEnum'

const getPrintsCompletedByJobFileID = createSelector(
  state => (
    state.history
      .filter(e => e.type === FINISH_PRINT)
      .countBy(e => e.jobFileID)
  ),
)

export default getPrintsCompletedByJobFileID
