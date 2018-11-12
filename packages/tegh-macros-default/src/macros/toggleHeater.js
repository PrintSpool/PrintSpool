import {
  getHeaterConfigs,
  getMaterials,
  ComponentTypeEnum
} from 'tegh-core'

import setTargetTemperature from './setTargetTemperature'

const { EXTRUDER, HEATED_BED } = ComponentTypeEnum

const toggleHeater = (args, { config }) => {
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

    switch (heater.type) {
      case EXTRUDER: {
        const material = getMaterials(config)(heater.materialID)
        targetTemperatures[id] = material.targetTemperature
        return null
      }
      case HEATED_BED: {
        // set the target bed temperature to the lowest bed temperature of
        // the materials loaded in the extruders
        const targetBedTemperature = heaters.toList()
          .filter(h => h.type === EXTRUDER)
          .map(({ materialID }) => (
            getMaterials(config)(materialID).targetBedTemperature
          ))
          .min()

        targetTemperatures[id] = targetBedTemperature
        return null
      }
      default: {
        throw new Error(`Unsupported heater type: ${heater.type}`)
      }
    }
  })

  return setTargetTemperature(targetTemperatures, { config })
}

export default toggleHeater
