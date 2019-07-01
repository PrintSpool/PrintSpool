import gpio from 'rpi-gpio'

const setupPins = ({ outputPins }) => {
  gpio.setMode(gpio.MODE_BCM)

  return Promise.all(
    outputPins.map(pin => gpio.promise.setup(pin, gpio.DIR_OUT)),
  )
}

export default setupPins
