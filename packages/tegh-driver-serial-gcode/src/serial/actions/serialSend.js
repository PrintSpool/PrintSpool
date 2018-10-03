import txParser from '../../txParser'

export const SERIAL_SEND = 'tegh-serial-driver/serial/SERIAL_SEND'

const NEWLINE = /\r\n|\r|\n/g

const checksum = (line) => {
  let sum = 0
  line.split('').forEach((char) => {
    // eslint-disable-next-line no-bitwise
    sum ^= char.charCodeAt(0)
  })
  // eslint-disable-next-line no-bitwise
  sum &= 0xff
  return sum
}

const serialSend = (line, { lineNumber }) => {
  if (
    typeof line !== 'string'
    || line.length === 0
    || line.match(NEWLINE) !== null
  ) {
    throw new Error(`Invalid gcode line ${JSON.stringify(line)}`)
  }

  const processedLine = (() => {
    if (lineNumber === false) return `${line}\n`
    if (typeof lineNumber !== 'number') {
      throw new Error('lineNumber must either be false or a number')
    }
    const lineWithLineNumber = `N${lineNumber} ${line}`
    return `${lineWithLineNumber}*${checksum(lineWithLineNumber)}\n`
  })()

  return {
    type: SERIAL_SEND,
    payload: {
      line: processedLine,
      lineNumber,
      ...txParser(line),
    },
  }
}

export default serialSend
