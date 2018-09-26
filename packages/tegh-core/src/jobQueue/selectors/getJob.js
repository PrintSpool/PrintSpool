import { createSelector } from 'reselect'

const getJob = createSelector(
  state => jobID => (
    state.jobs.get(jobID)
  ),
)

export default getJob
