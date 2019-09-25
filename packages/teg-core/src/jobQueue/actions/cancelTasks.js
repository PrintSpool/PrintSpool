export const CANCEL_TASKS = 'teg-core/jobQueue/CANCEL_TASKS'

const cancelTasks = ({ taskIDs }) => {
  if (taskIDs == null) {
    throw new Error('taskID cannot be null')
  }
  return {
    type: CANCEL_TASKS,
    payload: { taskIDs },
  }
}

export default cancelTasks
