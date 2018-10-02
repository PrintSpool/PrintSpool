import { createSelector } from 'reselect'

import getTasks from './getTasks'

const getTaskPercentComplete = createSelector(
  getTasks,
  tasks => ({ taskID, digits }) => {
    if (digits < 0) {
      throw new Error('digits cannot be negative')
    }

    const task = tasks.get(taskID)

    if (task == null) {
      throw new Error(`task ${taskID} does not exist`)
    }

    const factor = 10 ** digits
    const value = (task.currentLineNumber / task.data.size) * 100
    return Math.round(value * factor) / factor
  },
)

export default getTaskPercentComplete
