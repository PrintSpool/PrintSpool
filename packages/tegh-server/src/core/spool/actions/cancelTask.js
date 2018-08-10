export const CANCEL_TASK = 'tegh-server/spool/CANCEL_TASK'

const cancelTask = ({ taskID }) => {
  if (taskID == null) {
    throw new Error('taskID cannot be null')
  }
  return {
    type: CANCEL_TASK,
    payload: { id: taskID },
  }
}

export default cancelTask
