export const SERIAL_CLOSE = 'teg-driver-gcode/serial/SERIAL_CLOSE'

const serialClose = ({ serialPortID }) => ({
  type: SERIAL_CLOSE,
  payload: {
    serialPortID,
  },
})

export default serialClose
