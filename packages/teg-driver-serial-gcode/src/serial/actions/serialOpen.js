export const SERIAL_OPEN = 'tegh-driver-gcode/serial/SERIAL_OPEN'

const serialOpen = ({ serialPortID }) => ({
  type: SERIAL_OPEN,
  payload: {
    serialPortID,
  },
})

export default serialOpen
