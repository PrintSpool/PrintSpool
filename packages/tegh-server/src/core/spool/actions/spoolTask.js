import Task from '../types/Task'

export const SPOOL_TASK = 'tegh-server/spool/SPOOL_TASK'

/*
 * creates a new Task from the taskAttributes and spools it
 */
const spoolTask = (taskAttributes) => {
  return {
    type: SPOOL_TASK,
    payload: {
      task: Task(taskAttributes),
    },
  }
}

export default spoolTask
