import Task from '../types/Task'

export const DELETE_TASK = 'tegh-server/spool/DELETE_TASK'

const deleteTask = ({ id }) => ({
  type: DELETE_TASK,
  payload: { id },
})

export default deleteTask
