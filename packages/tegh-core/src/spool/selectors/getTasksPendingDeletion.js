import { createSelector } from 'reselect'

import getTasks from './getTasks'

import {
  DONE,
  ERRORED,
  CANCELLED,
} from '../types/TaskStatusEnum'

/*
 * returns tasks pending deletion - ie. those that are DONE, ERRORED and
 * CANCELLED and do not belong to a job.
 */
const getTasksPendingDeletion = createSelector(
  [getTasks],
  tasks => tasks
    .filter(task => (
      task.jobID == null
          && [DONE, ERRORED, CANCELLED].includes(task.status)
    )).toList(),
)

export default getTasksPendingDeletion
