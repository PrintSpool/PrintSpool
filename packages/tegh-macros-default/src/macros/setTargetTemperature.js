import {
  getHeaterConfigs,
  ComponentTypeEnum,
} from 'tegh-core'

const { BUILD_PLATFORM } = ComponentTypeEnum

const setTargetTemperature = (args, { config }) => {
  const heaters = getHeaterConfigs(config)
  const gcodeLines = []

  Object.entries(args).forEach(([id, v]) => {
    const heater = heaters.get(id)

    if (heater == null) throw new Error(`Heater ${id} does not exist`)
    if (typeof v !== 'number') throw new Error(`${id}: ${v} is not a number`)

    const component = config.printer.components.find(c => c.id === id)

    if (component.type === BUILD_PLATFORM) {
      gcodeLines.push(`M140 S${v}`)
    } else {
      const extruderNumber = parseFloat(component.model.get('address').slice(1))
      gcodeLines.push(`M104 S${v} T${extruderNumber}`)
    }
  })
  return gcodeLines
}

export default setTargetTemperature
