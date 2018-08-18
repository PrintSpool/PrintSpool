import {
  getHeaterConfigs,
  isHeatedBed,
  getMaterial,
} from 'tegh-server'

import setTargetTemperature from './setTemperature'

const toggleHeater = (args, state) => {
  const { config } = state
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

    switch(heater.type) {
      case EXTRUDER: {
        const material = getMaterial(config)(heater.materialID)
        targetTemperatures[id] = material.targetTemperature
        return null
      }
      case HEATED_BED: {
        // The bed temp will not update if the active extruder is changed which
        // may lead to unexpected behaviour for the user.
        const activeExtruder = getActiveExtruder(state)
        const material = getMaterial(config)(activeExtruder.materialID)

        targetTemperatures[enabledBedID] = material.targetBedTemperature
        return null
      }
      default: {
        throw new Error(`Unsupported heater type: ${heater.type}`)
      }
    }
  })

  return setTemperature(targetTemperatures, state)
}

export default toggleHeater
