import { createSelector } from 'reselect'

const getJobs = createSelector(
  state => state.jobs,
)

export default getJobs
