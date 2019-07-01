import { driverError } from '@tegapp/core'

const gpioError = ({ name, stack }) => driverError({
  code: `tegh-raspberry-pi/gpio/${name}`,
  message: stack,
})

export default gpioError
