import move from '../util/move'
import getMoveComponents from '../util/getMoveComponents'

// continuousMove should be called in a loop sending another mutation after each mutation returns 
// successfully.
// example useage: { continuousMove: { ms: { [id]: 400 } } }
const compileContinuousMove = ({
  args: { ms, axes, feedrateMultiplier = 1 },
  machineConfig,
}) => {
  const feedrates = []
  const components = getMoveComponents({
    axes,
    allowExtruderAxes: true,
    machineConfig,
  })

  components.forEach(({ component }) => {
    feedrates.push(component.model.get('feedrate'))
  })

  const feedrateMMPerMS = Math.min.apply(null, feedrates) * feedrateMultiplier / 1000

  const totalDistance = feedrateMMPerMS * ms

  //   ____________________
  // |/ x^2 + y^2 + z^2 ...  = totalDistance
  //
  // Move an equal distance on each axis. This is a simplification - it is valid for XY movements
  // but may not hold up well for mixed extrusion/Z/XY movements.
  const axeDistance = Math.sqrt((totalDistance ** 2) / Object.keys(axes).length)

  // console.log({ axeDistance })
  const distances = Object.entries(axes).reduce((acc, [address, { forward }]) => {
    acc[address] = axeDistance * (forward ? 1 : -1)
    return acc
  }, {})

  const { commands } = move({
    axes: distances,
    sync: false,
    allowExtruderAxes: true,
    relativeMovement: true,
    machineConfig,
  })

  return {
    // synchronize the previous movement and then move a short distance
    commands: [
      // M400 stops the previous movement before starting the next. If there was a command that
      // allowed us to not block the printer's movement but block this macro until it is
      // notified by the printer that the previous command is complete that would be ideal.
      'M400',
      ...commands,
    ],
  }
}

const continuousMoveMacro = {
  key: 'continuousMove',
  schema: {
    type: 'object',
    required: ['ms', 'axes'],
    properties: {
      axes: {
        type: 'object',
        properties: {
          forward: {
            type: 'boolean',
          },
        },
      },
      feedrateMultiplier: {
        type: 'number',
      },
    },
  },
  compile: compileContinuousMove,
}

export default continuousMoveMacro
