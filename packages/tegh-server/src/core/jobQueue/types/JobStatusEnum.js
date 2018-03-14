import {
  SPOOLED,
  PRINTING,
  ERRORED,
  CANCELLED,
} from '../../spool/types/TaskStatusEnum.js'

/* these task statuses bubble up through the jobFile to the job */
export const BUBBLING_STATUES = [
  SPOOLED,
  PRINTING,
  ERRORED,
  CANCELLED
]
