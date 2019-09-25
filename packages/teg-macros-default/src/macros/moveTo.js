import move from '../util/move'

// example useage: { moveTo: { positions: { [id]: 100 } } }
const compileMoveTo = ({
  args: { positions, sync },
  machineConfig,
}) => (
  move({
    axes: positions,
    sync,
    allowExtruderAxes: false,
    relativeMovement: false,
    machineConfig,
  })
)

const moveToMacro = {
  key: 'moveTo',
  schema: {
    type: 'object',
    required: ['position'],
    properties: {
      positions: {
        type: 'object',
        additionalProperties: { type: 'number' },
      },
      sync: {
        type: 'boolean',
      },
    },
  },
  compile: compileMoveTo,
}

export default moveToMacro
