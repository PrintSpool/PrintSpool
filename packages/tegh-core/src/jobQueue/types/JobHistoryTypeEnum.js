import { List } from 'immutable'

/*
 * START_EVENT: the first time a print is attempted or a re-print attempt after
 * a CANCEL_EVENT or ERROR_EVENT.
 */
export const SPOOL_PRINT = '/jobQueue/JobHistory/SPOOL_PRINT'
export const START_PRINT = '/jobQueue/JobHistory/START_PRINT'
export const CANCEL_PRINT = '/jobQueue/JobHistory/CANCEL_PRINT'
export const PRINT_ERROR = '/jobQueue/JobHistory/PRINT_ERROR'
export const FINISH_PRINT = '/jobQueue/JobHistory/FINISH_PRINT'

export const SPOOLED_TYPES = List([
  SPOOL_PRINT,
  START_PRINT,
])

const JobHistoryTypeEnum = List([
  SPOOL_PRINT,
  START_PRINT,
  CANCEL_PRINT,
  PRINT_ERROR,
  FINISH_PRINT,
])


export default JobHistoryTypeEnum
