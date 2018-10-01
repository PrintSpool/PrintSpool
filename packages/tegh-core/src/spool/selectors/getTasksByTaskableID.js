import { createSelector } from 'reselect'

import getTasks from './getTasks'

const getTasksByTaskableID = createSelector(
  getTasks,
  tasks => (
    tasks
      .groupBy(task => task.jobID)
      .merge(tasks.groupBy(task => task.jobFileID))
  ),
)

export default getTasksByTaskableID
