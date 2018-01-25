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
      return {
        source: 'RX',
        level: rxLevel(type),
        message: (
          (type === 'parser_error') ? `parser error on line: ${raw}` : raw
        ),
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
    default:
      return null
  }
}

export default logger
