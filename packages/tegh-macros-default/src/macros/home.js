import {
  createMacroExpansionReducer,
  axisExists,
  AxisTypeEnum,
} from 'tegh-core'

const { MOVEMENT_AXIS } = AxisTypeEnum

const meta = {
  package: 'tegh-macros-default',
  macro: 'home',
}

const home = createMacroExpansionReducer(meta, (
  args,
  { config },
) => {
  if (args.all === true) return ['G28']

  if (!Array.isArray(args) || args.length === 0) {
    throw new Error(
      'args must either be an array or axis names or {all: true}',
    )
  }

  const gcodeWords = ['G28']
  args.forEach(([k]) => {
    if (!axisExists(config)(k, { allowTypes: [MOVEMENT_AXIS] })) {
      throw new Error(`Axis ${k} does not exist`)
    }
    gcodeWords.push(k.toUpperCase())
  })
  return [
    gcodeWords.join(' '),
  ]
})

export default home
