export const CANCELLED = 'CANCELLED'
export const PAUSE_TASK = 'PAUSE_TASK'
export const ERROR = 'ERROR'
export const START_TASK = 'START_TASK'
export const FINISH_TASK = 'FINISH_TASK'
export const SPOOLED_TASK = 'SPOOLED_TASK'

const TaskStatusEnum = {
  CANCELLED,
  PAUSE_TASK,
  ERROR,
  START_TASK,
  FINISH_TASK,

  /* Combinator-only event(s) */
  SPOOLED_TASK,
}

export const indexedTaskStatuses = [
  CANCELLED, // 0
  PAUSE_TASK, // 1
  ERROR, // 2
  START_TASK, // 3
  FINISH_TASK, // 4
]

export const taskFailureStatuses = [
  CANCELLED,
  ERROR,
]

export const endedTaskStatuses = [
  CANCELLED,
  ERROR,
  FINISH_TASK,
]

export const spooledTaskStatuses = [
  PAUSE_TASK,
  START_TASK,
  SPOOLED_TASK,
]

export const busyMachineTaskStatuses = [
  PAUSE_TASK,
  START_TASK,
]

export default TaskStatusEnum
