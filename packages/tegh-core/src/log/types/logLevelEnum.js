import { List } from 'immutable'

export const TRIVIAL = 'trivial'
export const INFO = 'info'
export const WARNING = 'warning'
export const ERROR = 'error'
export const FATAL = 'fatal'

const logLevelEnum = List([
  TRIVIAL,
  INFO,
  WARNING,
  ERROR,
  FATAL,
])

export default logLevelEnum
