import { createSelector } from 'reselect'

import getTasks from './getTasks'

/*
 * returns tasks pending deletion - ie. those that are DONE, ERRORED and
 * CANCELLED and do not belong to a job.
 */
const getTasksPendingDeletion = createSelector(
  [ getTasks ],
  tasks => {
    return tasks.filter(task => {
      return (
        task.jobID == null
        && [DONE, ERRORED, CANCELLED].include(task.status)
      )
    })
  },
)

export default getTasksPendingDeletion
