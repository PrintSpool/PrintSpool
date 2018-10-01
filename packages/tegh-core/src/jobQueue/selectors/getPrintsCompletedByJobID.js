import { createSelector } from 'reselect'

import { FINISH_PRINT } from '../types/JobHistoryTypeEnum'

const getPrintsCompletedByJobID = createSelector(
  state => (
    state.history
      .filter(e => e.type === FINISH_PRINT)
      .countBy(e => e.jobID)
  ),
)

export default getPrintsCompletedByJobID
