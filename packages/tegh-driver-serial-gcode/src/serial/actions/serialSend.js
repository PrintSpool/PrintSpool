import { toGCodeLine } from '@tegh/core'
import txParser from '../../txParser'

export const SERIAL_SEND = 'tegh-serial-driver/serial/SERIAL_SEND'

const checksum = (line) => {
  let sum = 0
  line.split('').forEach((char) => {
    // eslint-disable-next-line no-bitwise
    sum ^= char.charCodeAt(0)
  })
  // eslint-disable-next-line no-bitwise
  sum &= 0xff
  return `${line}*${sum}\n`
}

const serialSend = ({ macro, args = {}, lineNumber } = {}) => {
  const line = toGCodeLine({ macro, args })

  const processedLine = (() => {
    if (lineNumber === false) return checksum(line)
    if (typeof lineNumber !== 'number') {
      throw new Error('lineNumber must either be false or a number')
    }
    const lineWithLineNumber = `N${lineNumber} ${line}`
    return checksum(lineWithLineNumber)
  })()

  return {
    type: SERIAL_SEND,
    payload: {
      macro,
      args,
      line: processedLine,
      lineNumber,
      ...txParser({ macro, args, line }),
    },
  }
}

export default serialSend
