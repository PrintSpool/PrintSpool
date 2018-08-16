import { Record, List } from 'immutable'

import { CLEAR_LOG } from '../actions/clearLog'

import getDriverPlugin from '../../config/selectors/getDriverPlugin'

import LOG_LEVELS from '../types/logLevelEnum'

const validLogEntry = (log) => {
  if (log == null) return log
  const { source, level, message } = log
  if (source == null || level == null || message == null) {
    const err = 'log must include source, level and message properties'
    throw new Error(err)
  }
  if (!LOG_LEVELS.includes(level)) {
    const err = `log level (${level}) must be one of ${LOG_LEVELS.join(', ')}`
    throw new Error(err)
  }
  return log
}

const initialState = Record({
  loggerPath: null,
  logEntries: List(),
  entryCountSinceStartup: 0,
})()

const logReducer = (
  state = initialState,
  action,
) => {
  const { config } = action

  if (action.type === CLEAR_LOG) return initialState

  const driverLogReducer = getDriverPlugin(config).logReducer

  if (driverLogReducer == null) return state

  const log = validLogEntry(driverLogReducer(null, action))

  if (log == null) return state

  // TODO: console.error is a side effect and would ideally be moved to a saga
  if (config.log.stderr.includes(log.level)) {
    // eslint-disable-next-line no-console
    console.error(`${log.source}[${log.level}]: ${log.message}`)
  }

  return state
    .update('logEntries', list => (
      (() => {
        if (list.size >= config.log.maxLength) {
          return list.shift()
        }
        return list
      })().push(log)
    ))
    .update('entryCountSinceStartup', count => count + 1)
}

export default logReducer
