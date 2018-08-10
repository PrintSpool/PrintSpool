import { createSelector } from 'reselect'
import _ from 'lodash'

import {
  DONE,
} from '../types/TaskStatusEnum'

import getTasksFor from './getTasksFor'

const getTasksCompleted = createSelector(
  [getTasksFor],
  tasksFor => _.memoize(({ taskableID }) => tasksFor({ taskableID })
    .filter(task => task.status === DONE)
    .size),
)

export default getTasksCompleted
