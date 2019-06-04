import {
  createMacroExpansionReducer,
  getHeaterConfigs,
  ComponentTypeEnum,
} from '@tegh/core'

const { BUILD_PLATFORM } = ComponentTypeEnum

const meta = {
  package: '@tegh/macros-default',
  macro: 'setTargetTemperatures',
}

// example useage:
// { setTargetTemperature: { heaters: { [id]: 220 }, sync: true } }
export const macroFn = (
  { heaters, sync },
  { config },
) => {
  const gcodeLines = []

  Object.entries(heaters).forEach(([id, v]) => {
    const heater = getHeaterConfigs(config).get(id)

    if (heater == null) throw new Error(`Heater ${id} does not exist`)
    if (typeof v !== 'number') throw new Error(`${id}: ${v} is not a number`)

    const component = config.printer.components.find(c => c.id === id)

    if (component.type === BUILD_PLATFORM) {
      gcodeLines.push({ m140: { s: v } })
    } else {
      const extruderNumber = parseFloat(component.model.get('address').slice(1))
      gcodeLines.push({ m104: { s: v, t: extruderNumber } })
    }
  })

  if (sync) {
    gcodeLines.push('M109')
  }

  return gcodeLines
}

const setTargetTemperature = createMacroExpansionReducer(meta, macroFn)

export default setTargetTemperature
