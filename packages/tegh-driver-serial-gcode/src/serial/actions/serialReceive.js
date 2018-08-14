export const SERIAL_RECEIVE = 'tegh-driver-gcode/serial/SERIAL_RECEIVE'

const serialReceive = payload => ({
  type: SERIAL_RECEIVE,
  payload,
})

export default serialReceive
