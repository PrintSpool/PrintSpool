import { Record } from 'immutable'
import Task from '../types/Task'

export const SPOOL_TASK = 'tegh-server/spool/SPOOL_TASK'

/*
 * creates a new Task and spools it
 */
const spoolTask = task => ({
  type: SPOOL_TASK,
  payload: {
    task: Record.isRecord(task) ? task : Task(task),
  },
})

export default spoolTask
