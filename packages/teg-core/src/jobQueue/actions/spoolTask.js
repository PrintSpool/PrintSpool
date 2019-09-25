import { Record } from 'immutable'
import Task from '../types/Task'

export const SPOOL_TASK = 'teg-core/jobQueue/SPOOL_TASK'

/*
 * creates a new Task and spools it
 */
const spoolTask = (task) => {
  const taskRecord = Record.isRecord(task) ? task : Task(task)

  return {
    type: SPOOL_TASK,
    payload: {
      task: taskRecord,
    },
  }
}

export default spoolTask
