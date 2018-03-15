import { createSelector } from 'reselect'
import _ from 'lodash'

import getTasks from './getTasks'

const getTaskPercentComplete = createSelector(
  [ getTasks ],
  tasks => _.memoize(({ taskID }) => {
    const task = tasks.get(taskID)
    return task.currentLineNumber / task.data.length * 100
  }),
)

export default getTaskPercentComplete
