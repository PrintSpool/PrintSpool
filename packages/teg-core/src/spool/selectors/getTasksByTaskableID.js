import { createSelector } from 'reselect'

import getTasks from './getTasks'

const getTasksByTaskableID = createSelector(
  getTasks,
  tasks => (
    tasks
      .toList()
      .groupBy(task => task.jobID)
      .merge(tasks.toList().groupBy(task => task.jobFileID))
  ),
)

export default getTasksByTaskableID
