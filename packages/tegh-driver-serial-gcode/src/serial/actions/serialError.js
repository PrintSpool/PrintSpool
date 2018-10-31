export const SERIAL_ERROR = 'tegh-driver-gcode/serial/SERIAL_ERROR'

const serialError = ({ portID, error }) => ({
  type: SERIAL_ERROR,
  payload: {
    portID,
    error,
  },
})

export default serialError
