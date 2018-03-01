export const SPOOLED = 'SPOOLED'
export const PRINTING = 'PRINTING'
export const ERRORED = 'ERRORED'
export const CANCELLED = 'CANCELLED'
export const DONE = 'DONE'

export type TaskStatusEnumT =
  | 'SPOOLED'
  | 'PRINTING'
  | 'ERRORED'
  | 'CANCELLED'
  | 'DONE'

const TaskStatusEnum = {
  SPOOLED,
  PRINTING,
  ERRORED,
  CANCELLED,
  DONE,
}

export default TaskStatusEnum

const spooledStatuses = [
  SPOOLED,
  PRINTING,
]

export const isSpooled = status => spooledStatuses.includes(status)
