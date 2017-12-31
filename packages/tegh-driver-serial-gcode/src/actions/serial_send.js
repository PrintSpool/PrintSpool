const NEWLINE = /\r\n|\r|\n/g

const checksum = (line) => {
  let sum = 0
  for (const char of line) {
    sum ^= char.charCodeAt(0)
  }
  sum &= 0xff
  return sum
}

const serialSend = (lineNumber, line) => {
  if (
    typeof line !== 'string' ||
    line.length === 0 ||
    line.match(NEWLINE) !== null
  ) {
    throw new Error(`Invalid gcode line ${JSON.stringify(line)}`)
  }
  const lineWithLineNumber = `N${lineNumber} ${line}`
  const lineWithChecksum = (
    `${lineWithLineNumber}*${checksum(lineWithLineNumber)}\n`
  )
  return {
    type: 'SERIAL_SEND',
    data: lineWithChecksum,
  }
}

export default serialSend
