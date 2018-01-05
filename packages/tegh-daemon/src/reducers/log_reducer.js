import { Map, List } from 'immutable'

const initialState = (crashReport = null) => {
  let entries = List()
  if (crashReport != null) {
    entries = entries.push(validLogEntry(crashReport))
  }
  return Map({
    entries,
    entryCountSinceStartup: entries.size,
  })
}

const LOG_LEVELS = [
  'info',
  'warning',
  'error',
  'fatal',
]

const validLogEntry = (log) => {
  if (log == null) return log
  const { source, level, message } = log
  if (source == null || level == null || message == null) {
    throw new Error(
      'log must include source, level and message properties'
    )
  }
  if (!LOG_LEVELS.includes(level)) {
    throw new Error(
      `log level (${level}) must be one of ${LOG_LEVELS.join(', ')}`
    )
  }
  return log
}

const logReducer = ({
  config,
  driver,
  crashReport,
}) => (
  state = initialState(validLogEntry(crashReport)),
  action,
) => {
  if (action.type === 'LOG_CLEAR') return initialState()
  if (driver.logger == null) return state
  const log = validLogEntry(driver.logger(action))
  if (log == null) return state
  return state
    .update('entries', list => (
      (() => {
        if (list.size >= config.log.maxLength) {
          return list.shift()
        } else {
          return list
        }
      })().push(log)
    ))
    .update('entryCountSinceStartup', (count) => count + 1)
}

export default logReducer
