export const SERIAL_OPEN = 'tegh-driver-gcode/serial/SERIAL_OPEN'

const serialOpen = ({ portID }) => ({
  type: SERIAL_OPEN,
  payload: {
    portID,
  },
})

export default serialOpen
