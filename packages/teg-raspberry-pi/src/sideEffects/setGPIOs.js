import gpio from 'rpi-gpio'

const setGPIOs = pins => (
  Promise.all(
    Object.entries(pins).map(([pin, value]) => (
      gpio.promise.write(pin, value)
    )),
  )
)

export default setGPIOs
