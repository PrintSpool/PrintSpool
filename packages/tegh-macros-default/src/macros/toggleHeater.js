import {
  getHeaterConfigs,
  isHeatedBed,
  getMaterial,
} from 'tegh-server'

import setTemperature from './setTemperature'

const toggleHeater = (args, config) => {
  const heaters = getHeaterConfigs(config)
  const targetTemperatures = {}
  let activeExtruder = null
  let enabledBedID = null

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
        activeExtruder = heater
        const material = getMaterial(config)(heater.materialID)
        targetTemperatures[id] = material.targetTemperature
        return null
      }
      case HEATED_BED: {
        enabledBedID = id
        return null
      }
      default: {
        throw new Error(`Unsupported heater type: ${heater.type}`)
      }
    }
  })

  if (enabledBedID) {
    // TODO: figure out how to get the rest of the state to the macro
    activeExtruder = activeExtruder || getActiveExtruder(state)
    const material = getMaterial(config)(activeExtruder.materialID)

    targetTemperatures[enabledBedID] = material.targetBedTemperature
  }

  return setTemperature(targetTemperatures, config)
}

export default toggleHeater
