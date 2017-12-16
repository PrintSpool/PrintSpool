import { createLogger } from 'redux-logger'

const loggerMiddleware = ({ config: { logLevel } }) => {
  const predicate = (() => {
    switch (logLevel) {
      case 'info':
        return null
      case 'warn':
        return (_getState, { log }) => log === 'warn' || log === 'error'
      case 'error':
        return (_getState, { log }) => log === 'error'
      default:
        throw new Error(`invalid logLevel ${logLevel}`)
    }
  })()

  return createLogger({
    predicate,
  })
}

export default loggerMiddleware
