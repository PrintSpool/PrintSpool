export const CANCEL_ALL_TASKS = 'tegh-server/spool/CANCEL_ALL_TASKS'

const cancelAllTasks = () => {
  return {
    type: CANCEL_ALL_TASKS,
  }
}

export default cancelAllTasks
