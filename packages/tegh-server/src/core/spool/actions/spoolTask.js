import Task from '../types/Task'
import { Record } from 'immutable'

export const SPOOL_TASK = 'tegh-server/spool/SPOOL_TASK'

/*
 * creates a new Task and spools it
 */
const spoolTask = (task) => {
  return {
    type: SPOOL_TASK,
    payload: {
      task: Record.isRecord(task) ? task : Task(task),
    },
  }
}

export default spoolTask
