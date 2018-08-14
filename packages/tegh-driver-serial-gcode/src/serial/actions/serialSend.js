import txParser from '../txParser.js'

export const SERIAL_SEND  = 'tegh-serial-driver/serial/SERIAL_SEND'

const NEWLINE = /\r\n|\r|\n/g

const checksum = (line) => {
  let sum = 0
  for (const char of line) {
    sum ^= char.charCodeAt(0)
  }
  sum &= 0xff
  return sum
}

const serialSend = (line, { lineNumber }) => {
  if (
    typeof line !== 'string' ||
    line.length === 0 ||
    line.match(NEWLINE) !== null
  ) {
    throw new Error(`Invalid gcode line ${JSON.stringify(line)}`)
  }
  const data = (() => {
    if (lineNumber === false) return `${line}\n`
    if (typeof lineNumber != 'number') {
      throw new Error('lineNumber must either be false or a number')
    }
    const lineWithLineNumber = `N${lineNumber} ${line}`
    return `${lineWithLineNumber}*${checksum(lineWithLineNumber)}\n`
  })()
  return {
    type: SERIAL_SEND,
    data,
    lineNumber,
    ...txParser(line),
  }
}

export default serialSend
