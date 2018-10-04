export const SERIAL_RECEIVE = 'tegh-driver-gcode/serial/SERIAL_RECEIVE'

const serialReceive = ({ serialPortID, data, receiveParser }) => {
  if (typeof data !== 'string') {
    throw new Error(`data must be a string (received: ${JSON.stringify(data)})`)
  }

  return {
    type: SERIAL_RECEIVE,
    payload: {
      serialPortID,
      ...receiveParser(data),
    },
  }
}

export default serialReceive
