import { Record, List } from 'immutable'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { CLEAR_LOG } from '../actions/clearLog'

import LOG_LEVELS from '../types/logLevelEnum'

import getDriverPlugin from '../../pluginManager/selectors/getDriverPlugin'

const validLogEntry = (log) => {
  if (log == null) return log
  const { source, level, message } = log
  if (source == null || level == null || message == null) {
    const err = 'log must include source, level and message properties'
    throw new Error(err)
  }
  if (!LOG_LEVELS.includes(level)) {
    const levelsString = LOG_LEVELS.toArray().join(', ')
    const err = `log level (${level}) must be one of ${levelsString}`
    throw new Error(err)
  }
  return log
}

const initialState = Record({
  logEntries: List(),
  entryCountSinceStartup: 0,
  config: Record({
    isInitialized: false,
    driverLogReducer: null,
    stderr: null,
    maxLength: null,
  })(),
})()

const logReducer = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case CLEAR_LOG: {
      return initialState.set('config', state.config)
    }
    case SET_CONFIG: {
      const { config } = action.payload

      return state.mergeIn(['config'], {
        isInitialized: true,
        driverLogReducer: getDriverPlugin(action.payload).logReducer,
        ...config.log,
      })
    }
    default: {
      const { config } = state
      if (!config.isInitialized) return state

      const log = validLogEntry(config.driverLogReducer(null, action))

      if (log == null) return state

      // TODO: console.error is a side effect and would ideally be moved to a saga
      if (config.stderr.includes(log.level)) {
        // eslint-disable-next-line no-console
        console.error(`${log.source}[${log.level}]: ${log.message}`)
      }

      return state
        .update('logEntries', list => (
          (() => {
            if (list.size >= config.maxLength) {
              return list.shift()
            }
            return list
          })().push(log)
        ))
        .update('entryCountSinceStartup', count => count + 1)
    }
  }
}

export default logReducer
