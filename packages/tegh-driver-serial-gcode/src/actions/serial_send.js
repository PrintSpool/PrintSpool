const checksum = (line) => {
  let sum = 0
  for (const char of line) {
    sum ^= char.charCodeAt(0)
  }
  sum &= 0xff
  return sum
}

const serialSend = (lineNumber, line) => {
  if (typeof line !== 'string') {
    throw new Error(`Invalid gcode line ${line}`)
  }
  const lineWithLineNumber = `N${lineNumber} ${line}`
  return {
    type: 'SERIAL_SEND',
    data: `${lineWithLineNumber}*${checksum(lineWithLineNumber)}\n`,
  }
}

export default serialSend
