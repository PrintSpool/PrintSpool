import { driverError } from '@tegapp/core'

const gpioError = ({ name, stack }) => driverError({
  code: `teg-raspberry-pi/gpio/${name}`,
  message: stack,
})

export default gpioError
