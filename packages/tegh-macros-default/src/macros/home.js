import {
  createMacroExpansionReducer,
  getComponents,
  axisExists,
  AxisTypeEnum,
} from '@tegh/core'

const { MOVEMENT_AXIS } = AxisTypeEnum

const meta = {
  package: '@tegh/macros-default',
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
    const component = getComponents(config).find(c => (
      c.model.get('address') === address
    ))

    gcodeWords.push(component.address.toUpperCase())
  })
  return [
    gcodeWords.join(' '),
  ]
})

export default home
