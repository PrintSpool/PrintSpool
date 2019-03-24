export const SERIAL_RECEIVE = 'tegh-driver-gcode/serial/SERIAL_RECEIVE'

const serialReceive = ({
  createdAt = Date.now(),
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
