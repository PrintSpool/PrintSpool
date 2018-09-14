export const DELETE_TASKS = 'tegh-core/spool/DELETE_TASKS'

const deleteTasks = ({ ids }) => ({
  type: DELETE_TASKS,
  payload: { ids },
})

export default deleteTasks
