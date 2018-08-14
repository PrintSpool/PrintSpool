export const SERIAL_CLOSE = 'tegh-driver-gcode/serial/SERIAL_CLOSE'

const serialClose = ({ resetByMiddleware }) => ({
  type: SERIAL_CLOSE,
  payload: {
    resetByMiddleware,
  }
})

export default serialClose
