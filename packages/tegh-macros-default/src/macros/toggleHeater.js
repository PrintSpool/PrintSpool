import {
  createMacroExpansionReducer,
  getHeaterConfigs,
  getHeaterMaterialTargets,
} from '@tegh/core'

import { macroFn as setTargetTemperature } from './setTargetTemperature'

const meta = {
  package: '@tegh/macros-default',
  macro: 'toggleHeater',
}

const toggleHeater = createMacroExpansionReducer(meta, (
  args,
  { config },
) => {
  const heaters = getHeaterConfigs(config)
  const targetTemperatures = {}

  Object.entries(args).forEach(([id, enable]) => {
    const heater = heaters.get(id)

    if (heater == null) {
      throw new Error(`heater (${id}) does not exist`)
    }

    if (!enable) {
      targetTemperatures[id] = 0
      return null
    }

    targetTemperatures[id] = getHeaterMaterialTargets(config).get(id)
  })

  return setTargetTemperature(targetTemperatures, { config })
})

export default toggleHeater
