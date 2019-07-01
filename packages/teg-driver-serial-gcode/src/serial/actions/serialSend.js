import { toGCodeLine } from '@tegapp/core'
import txParser from '../../txParser'

export const SERIAL_SEND = 'tegh-serial-driver/serial/SERIAL_SEND'

const addChecksum = (line, shouldChecksum) => {
  if (shouldChecksum === false) return `${line}\n`

  let sum = 0
  line.split('').forEach((char) => {
    // eslint-disable-next-line no-bitwise
    sum ^= char.charCodeAt(0)
  })
  // eslint-disable-next-line no-bitwise
  sum &= 0xff
  return `${line}*${sum}\n`
}

const serialSend = ({
  createdAt = new Date().toISOString(),
  macro,
  args = {},
  lineNumber,
  checksum = true,
  isPollingRequest = false,
} = {}) => {
  const gcode = toGCodeLine({ macro, args })

  const line = (() => {
    if (lineNumber === false) return addChecksum(gcode, checksum)
    if (typeof lineNumber !== 'number') {
      throw new Error('lineNumber must either be false or a number')
    }
    const lineWithLineNumber = `N${lineNumber} ${gcode}`
    return addChecksum(lineWithLineNumber, checksum)
  })()

  return {
    type: SERIAL_SEND,
    payload: {
      createdAt,
      macro,
      args,
      line,
      gcode,
      lineNumber,
      isPollingRequest,
      ...txParser({ macro, args, line: gcode }),
    },
  }
}

export default serialSend
