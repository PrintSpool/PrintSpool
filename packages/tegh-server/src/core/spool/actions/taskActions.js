export const SPOOL_TASK = 'tegh-server/spool/SPOOL_TASK'
export const DESPOOL_TASK = 'tegh-server/spool/DESPOOL_TASK'
export const CREATE_TASK = 'tegh-server/spool/CREATE_TASK'
export const DELETE_TASKS = 'tegh-server/spool/DELETE_TASKS'

export const spoolTask = ({ taskID }) => ({
  type: SPOOL_TASK,
  taskID,
})

export const despoolTask = () => ({
  type: DESPOOL_TASK,
})

/*
 * Adds tasks but does not spool them (see spoolTask).
 * tasks: [Task]
 */
export const createTask = ({ tasks }) => ({
  type: CREATE_TASK,
  tasks,
})
