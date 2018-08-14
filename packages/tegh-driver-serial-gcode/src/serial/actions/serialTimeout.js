import { driverError } from 'tegh-server'

export const SERIAL_TIMEOUT = 'tegh-driver-serial-gcode/serial/SERIAL_TIMEOUT'

const serialTimeout = () => (
  driverError({
    code: SERIAL_TIMEOUT,
    message: 'Timed out attempting to communicate over USB with the Printer',
  })
)

export default serialTimeout
