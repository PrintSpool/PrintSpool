import {
  createMacroExpansionReducer,
  getComponents,
  axisExists,
  AxisTypeEnum,
} from '@tegapp/core'

const { MOVEMENT_AXIS } = AxisTypeEnum

const meta = {
  package: '@tegapp/macros-default',
  macro: 'home',
}

// example useage:
// { home: { axes: 'all' } }
// { home: { axes: [ axisID1, axisID2 ] } }
const home = createMacroExpansionReducer(meta, (
  { axes },
  { config },
) => {
  if (axes === 'all') return ['G28']

  if (!Array.isArray(axes) || axes.length === 0) {
    throw new Error(
      'axes must either be an array or axis names or {all: true}',
    )
  }

  const gcodeWords = ['G28']
  axes.forEach(([address]) => {
    if (!axisExists(config)(address, { allowTypes: [MOVEMENT_AXIS] })) {
      throw new Error(`Axis ${address} does not exist`)
    }

    gcodeWords.push(address.toUpperCase())
  })
  return [
    gcodeWords.join(' '),
  ]
})

export default home
