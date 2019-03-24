import {
  createMacroExpansionReducer,
  getHeaterConfigs,
  getMaterials,
  ComponentTypeEnum,
} from '@tegh/core'

import { macroFn as setTargetTemperature } from './setTargetTemperature'

const { TOOLHEAD, BUILD_PLATFORM } = ComponentTypeEnum

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

    const getMaterialForToolhead = (toolhead) => {
      const materialID = toolhead.model.get('materialID')
      const material = getMaterials(config).get(materialID)

      if (material == null) {
        throw new Error(`material ${materialID} does not exists`)
      }

      return material
    }

    switch (heater.type) {
      case TOOLHEAD: {
        const material = getMaterialForToolhead(heater)
        targetTemperatures[id] = material.model.get('targetExtruderTemperature')
        return null
      }
      case BUILD_PLATFORM: {
        // set the target bed temperature to the lowest bed temperature of
        // the materials loaded in the extruders
        const targetBedTemperature = heaters.toList()
          .filter(h => h.type === TOOLHEAD)
          .map(t => getMaterialForToolhead(t).model.get('targetBedTemperature'))
          .min()

        targetTemperatures[id] = targetBedTemperature
        return null
      }
      default: {
        throw new Error(`Unsupported heater type: ${heater.type}`)
      }
    }
  })

  console.log({ targetTemperatures })
  return setTargetTemperature(targetTemperatures, { config })
})

export default toggleHeater
