import Task from '../types/Task'

export const DESPOOL_TASK = 'tegh-server/spool/DESPOOL_TASK'
export const CREATE_TASK = 'tegh-server/spool/CREATE_TASK'
export const DELETE_TASK = 'tegh-server/spool/DELETE_TASK'

/*
 * Accepted by the taskReducer but not exposed by the spoolReducer. Calling
 * createTask outside of the taskReducer is a no-op
 *
 * Initializes a task but does not spool them (see spoolTask).
 *
 * task: TaskAttributes
 */
export const createTask = (taskAttributes) => ({
    type: CREATE_TASK,
    payload: {
      task: Task(taskAttributes),
    },
  }
})

export const despoolTask = () => ({
  type: DESPOOL_TASK,
})

/*
 * Accepted by the taskReducer but not exposed by the spoolReducer. Calling
 * startTask outside of the taskReducer is a no-op
 */
export const startTask = () => ({
  type: START_TASK,
})

export const deleteTask = ({ id }) => ({
  type: DELETE_TASK,
  payload: { id },
})
