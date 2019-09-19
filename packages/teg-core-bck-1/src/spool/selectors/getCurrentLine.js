import { createSelector } from 'reselect'

import getCurrentTask from './getCurrentTask'

const getCurrentLine = createSelector(
  getCurrentTask,
  (task) => {
    if (task == null) return null
    return task.data.get(task.currentLineNumber)
  },
)

export default getCurrentLine
