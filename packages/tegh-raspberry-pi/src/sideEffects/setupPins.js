import gpio, { promise as gpiop } from 'gpio'

const setupPins = ({ outputPins }) => (
  Promise.all(
    outputPins.map(pin => gpiop.setup(pin, gpio.DIR_OUT)),
  )
)

export default setupPins
