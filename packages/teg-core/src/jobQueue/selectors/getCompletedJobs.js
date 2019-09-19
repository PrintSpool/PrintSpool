import { createSelector } from 'reselect'

import getIsDoneByJobID from './getIsDoneByJobID'

const getCompletedJobs = createSelector(
  state => state,
  state => state.jobs.filter(job => getIsDoneByJobID(state).get(job.id)),
)

export default getCompletedJobs
