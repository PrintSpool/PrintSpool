export const SERIAL_RECEIVE = 'teg-driver-gcode/serial/SERIAL_RECEIVE'

const serialReceive = ({
  createdAt = new Date().toISOString(),
  serialPortID,
  data,
  receiveParser,
}) => {
  if (typeof data !== 'string') {
    throw new Error(`data must be a string (received: ${JSON.stringify(data)})`)
  }

  return {
    type: SERIAL_RECEIVE,
    payload: {
      createdAt,
      serialPortID,
      ...receiveParser(data),
    },
  }
}

export default serialReceive
