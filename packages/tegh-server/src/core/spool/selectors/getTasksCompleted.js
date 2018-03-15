import { createSelector } from 'reselect'
import _ from 'lodash'

import getTasksFor from './getTasksFor'

const getTasksCompleted = createSelector(
  [ getTasksFor ],
  tasksFor => _.memoize(({ taskableID }) => {
    return tasksFor({ taskableID })
      .filter(task => task.status === 'done')
      .size
  }),
)

export default getTasksCompleted
