import { driverError } from '@tegh/core'

const gpioError = ({ name, message, stack }) => driverError({
  code: `tegh-raspberry-pi/gpio/${name}`,
  message,
  stack,
})

export default gpioError
