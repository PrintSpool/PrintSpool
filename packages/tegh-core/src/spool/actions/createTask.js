export const CREATE_TASK = 'tegh-core/spool/CREATE_TASK'

/*
 * Accepted by the taskReducer but not exposed by the spoolReducer. Calling
 * createTask outside of the taskReducer is a no-op
 *
 * Initializes a task but does not spool them (see spoolTask).
 *
 * task: TaskAttributes
 */
const createTask = ({ task }) => ({
  type: CREATE_TASK,
  payload: {
    task,
  },
})

export default createTask
