const numberedLineSendPattern = action => (
  action.type === 'SERIAL_SEND' &&
  typeof action.lineNumber === 'number'
)

export numberedLineSendPattern
