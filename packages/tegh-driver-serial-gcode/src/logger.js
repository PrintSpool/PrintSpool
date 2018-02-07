const rxLevel = (type) => {
  switch(type) {
    case 'error':
      return 'error'
    case 'parser_error':
      return 'warning'
    default:
      return 'info'
  }
}

const logger = (action) => {
  switch(action.type) {
    case 'SERIAL_RECEIVE':
      const { raw, type } = action.data
      const message = (() => {
        if (type === 'parser_error') {
          return `parser error on line: ${JSON.stringify(raw)}`
        }
        return raw
      })()
      return {
        source: 'RX',
        level: rxLevel(type),
        message,
      }
    case 'SERIAL_SEND':
      return {
        source: 'TX',
        level: 'info',
        message: action.data,
      }
    case 'SERIAL_RESET':
      return {
        source: 'SERIAL',
        level: 'info',
        message: 'Serial Reset',
      }
    case 'SERIAL_CLOSE':
      return {
        source: 'SERIAL',
        level: 'info',
        message: 'Serial Disconnected',
      }
    case 'SERIAL_OPEN':
      return {
        source: 'SERIAL',
        level: 'info',
        message: 'Serial Connected',
      }
    case 'DRIVER_ERROR':
      return {
        source: action.error.code === 'FIRMWARE_ERROR' ? 'FIRMWARE' : 'DRIVER',
        level: 'error',
        message: action.error.message,
      }
    default:
      return {
        source: 'ACTION',
        level: 'trivial',
        message: JSON.stringify(action),
      }
  }
}

export default logger
