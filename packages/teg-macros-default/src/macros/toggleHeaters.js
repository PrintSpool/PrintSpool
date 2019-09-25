import {
  getHeaterConfigs,
  getHeaterMaterialTargets,
} from '@tegapp/core'

import { compileSetTargetTemperatures } from './setTargetTemperatures'

// const component = machineConfig.components.find(c => (
//   c.model.get('address') === address
// ))

// if (component == null || component.type !== TOOLHEAD) {
//   throw new Error(`Toolhead (${address}) does not exist`)
// }

// const materialID = toolheadMaterials.get(component.id)
// const material = combinatorConfig.materials.find(m => m.id === materialID)

// example useage: { toggleHeaters: { heaters: { [id]: true }, sync: true }}
const compileToggleHeaters = ({
  args: { heaters, sync },
  machineConfig,
  combinatorConfig,
}) => {
  const targetTemperatures = {}

  Object.entries(heaters).forEach(([address, enable]) => {
    const heater = getHeaterConfigs(machineConfig).find(c => (
      c.model.get('address') === address
    ))

    if (heater == null) {
      throw new Error(`heater (${address}) does not exist`)
    }

    if (enable) {
      targetTemperatures[address] = (
        getHeaterMaterialTargets({ machineConfig, combinatorConfig }).get(heater.id) || 0
      )
    } else {
      targetTemperatures[address] = 0
    }
  })

  const setTempArgs = { heaters: targetTemperatures, sync }

  return compileSetTargetTemperatures({
    args: setTempArgs,
    machineConfig,
    combinatorConfig,
  })
}

const toggleHeatersMacro = {
  key: 'toggleHeaters',
  schema: {
    type: 'object',
    required: ['heaters'],
    properties: {
      heaters: {
        type: 'object',
        additionalProperties: {
          type: 'boolean',
        },
      },
      sync: {
        type: 'boolean',
      },
    },
  },
  compile: compileToggleHeaters,
}

export default toggleHeatersMacro
