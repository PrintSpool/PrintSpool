export const SERIAL_ERROR = 'teg-driver-gcode/serial/SERIAL_ERROR'

const serialError = ({ serialPortID, error }) => ({
  type: SERIAL_ERROR,
  payload: {
    serialPortID,
    error,
  },
})

export default serialError
