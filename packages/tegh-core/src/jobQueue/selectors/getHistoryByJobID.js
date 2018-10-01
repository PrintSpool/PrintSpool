import { createSelector } from 'reselect'

const getHistoryByJobID = createSelector(
  state => state.history.groupBy(e => e.jobID),
)

export default getHistoryByJobID
