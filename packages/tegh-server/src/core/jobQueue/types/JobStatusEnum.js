import {
  SPOOLED,
  PRINTING,
  ERRORED,
  CANCELLED,
} from '../../spool/types/TaskStatusEnum.js'

export {
  SPOOLED,
  PRINTING,
  ERRORED,
  CANCELLED,
  DONE,
} from '../../spool/types/TaskStatusEnum.js'

export const QUEUED = 'QUEUED'

/* these task statuses bubble up through the jobFile to the job */
export const BUBBLING_STATUES = [
  SPOOLED,
  PRINTING,
  ERRORED,
  CANCELLED
]
