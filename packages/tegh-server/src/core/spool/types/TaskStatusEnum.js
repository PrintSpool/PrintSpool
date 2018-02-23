export type TaskStatusEnumT =
  | 'initialized'
  | 'queued'
  | 'printing'
  | 'errored'
  | 'cancelled'
  | 'done'

const spooledStatuses = [
  'queued',
  'printing',
]

export const isSpooled = status => spooledStatuses.includes(status)
