/*
 * delays execution of the next gcode by a number of milliseconds
 * args:
 *  period: the number of milliseconds to wait
 *
 * example use: { delay: { period: 5000 } }
 */
const compileDelay = ({
  args: { period },
}) => ({
  commands: [`G4 P${period}`],
})

const delayMacro = {
  key: 'delay',
  schema: {
    type: 'object',
    properties: {
      period: {
        type: 'number',
      },
    },
  },
  compile: compileDelay,
}

export default delayMacro
