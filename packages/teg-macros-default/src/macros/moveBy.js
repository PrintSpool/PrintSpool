import move from '../util/move'

// example useage: { moveBy: { distances: { [id]: 100 } } }
const compileMoveBy = ({
  args: { distances, feedrate, sync },
  machineConfig,
}) => (
  move({
    axes: distances,
    feedrate,
    sync,
    allowExtruderAxes: true,
    relativeMovement: true,
    machineConfig,
  })
)

const moveByMacro = {
  key: 'moveBy',
  schema: {
    type: 'object',
    required: ['distances'],
    properties: {
      distances: {
        type: 'object',
        additionalProperties: { type: 'number' },
      },
      feedrate: {
        type: 'number',
      },
      sync: {
        type: 'boolean',
      },
    },
  },
  compile: compileMoveBy,
}

export default moveByMacro
