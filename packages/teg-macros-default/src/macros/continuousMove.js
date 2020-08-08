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

  const feedrateMMPerS = Math.min.apply(null, feedrates) * feedrateMultiplier

  const totalDistance = feedrateMMPerS / 1000 * ms

  //   ____________________
  // |/ x^2 + y^2 + z^2 ...  = totalDistance
  //
  // Move an equal distance on each axis. This is a simplification - it is valid for XY movements
  // but may not hold up well for mixed extrusion/Z/XY movements.
  const axeDistance = Math.sqrt((totalDistance ** 2) * Object.keys(axes).length)

  const segmentCount = 3
  const segmentDistances = Object.entries(axes).reduce((acc, [address, { forward }]) => {
    acc[address] = axeDistance * (forward ? 1 : -1) / segmentCount
    return acc
  }, {})

  console.log(Math.min.apply(null, feedrates), totalDistance, axeDistance, { segmentDistances })

  const directions = Object.entries(axes).reduce((acc, [address, { forward }]) => {
    acc[address] = { forward }
    return acc
  }, {})

  let { commands } = move({
    axes: segmentDistances,
    sync: false,
    allowExtruderAxes: true,
    relativeMovement: true,
    machineConfig,
    feedrate: feedrateMMPerS,
  })

  commands = commands.filter(c => (
    c !== 'G90'
    && c !== 'G91'
    && !(c.g1 && Object.keys(c.g1) === ['f'])
  ))

  console.log(commands)

  return {
    commands: [
      'M114',
      // record the previous target position
      `!${JSON.stringify({ markTargetPosition: {} }).replace('\n', ' ')}`,
      // send the new movements before blocking so that the printer does not decelerate between
      // moves
      // Splitting the moves also seems to reduce toolhead pauses
      'G91',
      ...commands,
      ...commands,
      ...commands,
      'G90',
      // wait to reach the previous target position and then unblock
      `!${JSON.stringify({ waitToReachMark: { axes: directions } }).replace('\n', ' ')}`,
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
