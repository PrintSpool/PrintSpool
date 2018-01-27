import setTemperature from './setTemperature'

const toggleHeater = (args, config) => {
  let lines = []
  Object.entries(args).forEach(([id, enable]) => {
    if (!config.heaters.includes(id)) {
      throw new Error(`heater (${id}) does not exist`)
    }
    let targetTemperature = 0
    if (enable) {
      const material = config.materials[id]
      if (material == null) {
        throw new Error(`no material configured for ${id}`)
      }
      targetTemperature = material.targetTemperature
      if (targetTemperature == null) {
        throw new Error(`no targetTemperature configured for ${id} material`)
      }
    }
    lines = lines.concat(
      setTemperature({ [id]: targetTemperature }, config)
    )
  })
  return lines
}

export default toggleHeater
