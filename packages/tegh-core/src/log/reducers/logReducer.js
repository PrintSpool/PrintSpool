import { Record, List } from 'immutable'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { CLEAR_LOG } from '../actions/clearLog'

import LOG_LEVELS from '../types/logLevelEnum'

import getPlugins from '../../pluginManager/selectors/getPlugins'

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
    pluginsLogReducer: null,
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

      const chainPluginLogReducers = (nextLogReducer, plugin) => {
        if (plugin.logReducer == null) return nextLogReducer
        return (laterState, laterAction) => {
          const log = plugin.logReducer(laterState, laterAction)
          if (log != null) return log
          // fallback to the next plugin's log reducer if this one returns null
          return nextLogReducer(laterState, laterAction)
        }
      }

      const pluginsLogReducer = getPlugins(action.payload)
        .reduce(chainPluginLogReducers, () => ({
          source: 'ACTION',
          level: 'trivial',
          message: action.type,
        }))

      return state.mergeIn(['config'], {
        isInitialized: true,
        pluginsLogReducer,
        ...config.host.log.toJS(),
      })
    }
    default: {
      const { config } = state
      if (!config.isInitialized) return state

      const log = validLogEntry(config.pluginsLogReducer(null, action))

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
