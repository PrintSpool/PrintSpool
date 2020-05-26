import move from '../util/move'
import getMoveComponents from '../util/getMoveComponents'

// continuousMove should be called in a loop sending another mutation after each mutation returns 
// successfully.
// example useage: { continuousMove: { ms: { [id]: 400 } } }
const compileContinuousMove = ({
  args: { ms, axes },
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

  const feedrate = Math.min.apply(null, feedrates) * 60 * 1000

  const totalDistance = feedrate * ms
  //   ____________________
  // |/ x^2 + y^2 + z^2 ...  = totalDistance
  //
  // Move an equal distance on each axis. This is a simplification - it is valid for XY movements
  // but may not hold up well for mixed extrusion/Z/XY movements.
  const axeDistance = Math.sqrt((totalDistance ** 2) / axes.length)

  const distances = Object.entries(axes).reduce((acc, [address, { forward }]) => {
    acc[address] = axeDistance * (forward ? 1 : -1)
    return acc
  })

  const { commands } = move({
    axes: distances,
    sync: false,
    allowExtruderAxes: true,
    relativeMovement: true,
    machineConfig,
  })

  return {
    commands: [
      'M400', // synchronize the previous movement and then move a short distance
      ...commands,
    ],
  }
}

const continuousMoveMacro = {
  key: 'continuousMove',
  schema: {
    type: 'object',
    required: ['ms'],
    properties: {
      axes: {
        type: 'object',
        properties: {
          forward: {
            type: 'boolean',
          },
        },
      },
    },
  },
  compile: compileContinuousMove,
}

export default continuousMoveMacro
