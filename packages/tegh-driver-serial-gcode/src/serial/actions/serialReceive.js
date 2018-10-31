export const SERIAL_RECEIVE = 'tegh-driver-gcode/serial/SERIAL_RECEIVE'

const serialReceive = ({ portID, data, receiveParser }) => {
  if (typeof data !== 'string') {
    throw new Error(`data must be a string (received: ${JSON.stringify(data)})`)
  }

  return {
    type: SERIAL_RECEIVE,
    payload: {
      portID,
      ...receiveParser(data),
    },
  }
}

export default serialReceive
