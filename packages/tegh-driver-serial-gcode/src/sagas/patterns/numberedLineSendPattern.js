const numberedLineSendPattern = action => (
  action.type === 'SERIAL_SEND' &&
  typeof action.lineNumber === 'number'
)

export default numberedLineSendPattern
