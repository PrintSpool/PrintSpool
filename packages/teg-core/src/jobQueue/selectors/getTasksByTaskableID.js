import { createSelector } from 'reselect'

const getTasksByTaskableID = createSelector(
  config => config.tasks,
  tasks => (
    tasks
      .toList()
      .groupBy(task => task.jobID)
      .merge(tasks.toList().groupBy(task => task.jobFileID))
  ),
)

export default getTasksByTaskableID
