const firmwareErrorPattern = action => (
  action.type === 'SERIAL_RECEIVE' &&
  action.data.type === 'error'
)

export default firmwareErrorPattern
