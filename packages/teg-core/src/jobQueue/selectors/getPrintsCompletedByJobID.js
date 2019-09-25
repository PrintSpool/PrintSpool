import { createSelector } from 'reselect'

import { FINISH_TASK } from '../types/TaskStatusEnum'

const getPrintsCompletedByJobID = createSelector(
  state => state.history,
  history => (
    history
      .filter(e => e.type === FINISH_TASK)
      .countBy(e => e.jobID)
  ),
)

export default getPrintsCompletedByJobID
