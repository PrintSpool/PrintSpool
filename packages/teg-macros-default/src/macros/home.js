import {
  axisExists,
  AxisTypeEnum,
} from '@tegapp/core'

const { MOVEMENT_AXIS } = AxisTypeEnum

// example useage:
// { home: { axes: 'all' } }
// { home: { axes: [ axisID1, axisID2 ] } }
const compileHome = ({
  args: { axes },
  machineConfig,
}) => {
  if (axes === 'all') return ['G28']

  if (!Array.isArray(axes) || axes.length === 0) {
    throw new Error(
      'axes must either be an array or axis names or {all: true}',
    )
  }

  const gcodeWords = ['G28']

  axes.forEach(([address]) => {
    if (!axisExists(machineConfig)(address, { allowTypes: [MOVEMENT_AXIS] })) {
      throw new Error(`Axis ${address} does not exist`)
    }

    gcodeWords.push(address.toUpperCase())
  })

  return {
    commands: [gcodeWords.join(' ')],
  }
}

const homeMacro = {
  key: 'home',
  schema: {
    type: 'object',
    required: ['axes'],
    properties: {
      axes: {
        oneOf: [
          { type: 'string' },
          { type: 'array', contains: { type: 'string' } },
        ],
      },
    },
  },
  compile: compileHome,
}

export default homeMacro
