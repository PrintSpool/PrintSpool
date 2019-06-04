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

  Object.entries(heaters).forEach(([address, enable]) => {
    const heater = getHeaterConfigs(config).find(c => (
      c.model.get('address') === address
    ))

    if (heater == null) {
      throw new Error(`heater (${address}) does not exist`)
    }

    if (enable) {
      targetTemperatures[address] = (
        getHeaterMaterialTargets(config).get(heater.id)
      )
    } else {
      targetTemperatures[address] = 0
    }
  })

  const setTempArgs = { heaters: targetTemperatures, sync }

  return setTargetTemperatures(setTempArgs, { config })
})

export default toggleHeaters
