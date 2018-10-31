export const CANCEL_TASK = 'tegh-core/spool/CANCEL_TASK'

const cancelTask = ({ taskID }) => {
  if (taskID == null) {
    throw new Error('taskID cannot be null')
  }
  return {
    type: CANCEL_TASK,
    payload: { taskID },
  }
}

export default cancelTask
