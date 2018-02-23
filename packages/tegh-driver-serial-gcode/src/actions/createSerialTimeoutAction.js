import { driverError } from 'tegh-server'

const createSerialTimeoutAction = () => (
  driverError({
    code: 'SERIAL_TIMEOUT',
    message: 'Timed out attempting to communicate over USB with the Printer',
  })
)

export default createSerialTimeoutAction
