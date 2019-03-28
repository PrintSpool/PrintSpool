import { createSelector } from 'reselect'

/*
 * get the percent complete (0 to 100) for the task
 */
const getTaskPercentComplete = createSelector(
  args => args,
  ({ task, digits = 2 }) => {
    if (digits < 0) {
      throw new Error('digits cannot be negative')
    }

    if (task == null) {
      throw new Error('task cannot not be null')
    }

    const factor = 10 ** digits
    const value = (task.currentLineNumber / task.data.size) * 100
    return Math.round(value * factor) / factor
  },
)

export default getTaskPercentComplete
