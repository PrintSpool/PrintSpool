export const REQUEST_SERIAL_PORT_TICKLE = 'teg-driver-serial-gcode/spool/REQUEST_SERIAL_PORT_TICKLE'

const requestSerialPortTickle = ({
  createdAt,
  awaitingLineNumber,
}) => ({
  type: REQUEST_SERIAL_PORT_TICKLE,
  payload: {
    createdAt,
    awaitingLineNumber,
  },
})

export default requestSerialPortTickle
