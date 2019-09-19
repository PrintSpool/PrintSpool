import { Record } from 'immutable'
import Task from '../types/Task'

export const SPOOL_TASK = 'teg-core/spool/SPOOL_TASK'

/*
 * creates a new Task and spools it
 */
const spoolTask = (task, { prepend = false } = {}) => ({
  type: SPOOL_TASK,
  payload: {
    prepend,
    task: Record.isRecord(task) ? task : Task(task),
  },
})

export default spoolTask
