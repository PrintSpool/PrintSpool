export const SERIAL_ERROR = 'tegh-driver-gcode/serial/SERIAL_ERROR'

const serialError = ({ error }) => ({
  type: SERIAL_ERROR,
  payload: {
    error,
  },
})

export default serialError
