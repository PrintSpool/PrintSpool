export const REQUEST_SERIAL_PORT_TICKLE = 'tegh-driver-serial-gcode/spool/REQUEST_SERIAL_PORT_TICKLE'

const requestSerialPortTickle = ({ awaitingLineNumber }) => ({
  type: REQUEST_SERIAL_PORT_TICKLE,
  payload: {
    awaitingLineNumber,
  },
})

export default requestSerialPortTickle
