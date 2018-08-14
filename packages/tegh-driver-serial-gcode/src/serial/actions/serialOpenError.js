export const SERIAL_OPEN_ERROR = 'tegh-driver-gcode/serial/SERIAL_OPEN_ERROR'

const serialError = ({ error }) => ({
  type: SERIAL_OPEN_ERROR,
  payload: {
    error,
  },
})

export default serialError
