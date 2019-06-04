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
  axes.forEach(([id]) => {
    if (!axisExists(config)(id, { allowTypes: [MOVEMENT_AXIS] })) {
      throw new Error(`Axis ${id} does not exist`)
    }
    const component = getComponents(config).get(id)

    gcodeWords.push(component.address.toUpperCase())
  })
  return [
    gcodeWords.join(' '),
  ]
})

export default home
