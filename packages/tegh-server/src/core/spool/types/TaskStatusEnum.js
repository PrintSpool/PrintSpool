export type TaskStatusEnumT =
  | 'spooled'
  | 'printing'
  | 'errored'
  | 'cancelled'
  | 'done'

const spooledStatuses = [
  'spooled',
  'printing',
]

export const isSpooled = status => spooledStatuses.includes(status)
