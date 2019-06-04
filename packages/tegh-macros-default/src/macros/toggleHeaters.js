import {
  createMacroExpansionReducer,
  getHeaterConfigs,
  getHeaterMaterialTargets,
} from '@tegh/core'

import { macroFn as setTargetTemperatures } from './setTargetTemperatures'

const meta = {
  package: '@tegh/macros-default',
  macro: 'toggleHeaters',
}

// example useage: { toggleHeaters: { heaters: { [id]: true }, sync: true }}
const toggleHeaters = createMacroExpansionReducer(meta, (
  { heaters, sync },
  { config },
) => {
  const targetTemperatures = {}

  Object.entries(heaters).forEach(([id, enable]) => {
    const heater = getHeaterConfigs(config).get(id)

    if (heater == null) {
      throw new Error(`heater (${id}) does not exist`)
    }

    if (!enable) {
      targetTemperatures[id] = 0
      return null
    }

    targetTemperatures[id] = getHeaterMaterialTargets(config).get(id)
  })

  const setTempArgs = { heaters: targetTemperatures, sync }

  return setTargetTemperatures(setTempArgs, { config })
})

export default toggleHeaters
