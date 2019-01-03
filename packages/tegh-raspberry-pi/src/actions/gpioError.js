import { driverError } from '@tegh/core'

const gpioError = reason => driverError({
  code: 'tegh-raspberry-pi/gpioError',
  message: `GPI Error: ${reason}`,
})

export default gpioError
