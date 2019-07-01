import {
  createMacroExpansionReducer,
  getHeaterConfigs,
  ComponentTypeEnum,
} from '@tegapp/core'

const { BUILD_PLATFORM } = ComponentTypeEnum

const meta = {
  package: '@tegapp/macros-default',
  macro: 'setTargetTemperatures',
}

// example useage:
// { setTargetTemperature: { heaters: { e0: 220 }, sync: true } }
export const macroFn = (
  { heaters, sync },
  { config },
) => {
  const gcodeLines = []

  Object.entries(heaters).forEach(([address, v]) => {
    const heater = getHeaterConfigs(config).find(h => (
      h.model.get('address') === address
    ))

    if (heater == null) {
      throw new Error(`Heater ${address} does not exist`)
    }
    if (typeof v !== 'number') {
      throw new Error(`${address}: ${v} is not a number`)
    }

    if (heater.type === BUILD_PLATFORM) {
      gcodeLines.push({ m140: { s: v } })
    } else {
      const extruderNumber = parseFloat(address.slice(1))
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
