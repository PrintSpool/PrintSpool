import Task from '../types/Task'

export const DELETE_TASKS = 'tegh-server/spool/DELETE_TASKS'

const deleteTasks = ({ ids }) => ({
  type: DELETE_TASKS,
  payload: { ids },
})

export default deleteTasks
