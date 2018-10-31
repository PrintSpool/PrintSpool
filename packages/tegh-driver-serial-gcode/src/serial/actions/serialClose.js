export const SERIAL_CLOSE = 'tegh-driver-gcode/serial/SERIAL_CLOSE'

const serialClose = ({ portID }) => ({
  type: SERIAL_CLOSE,
  payload: {
    portID,
  },
})

export default serialClose
