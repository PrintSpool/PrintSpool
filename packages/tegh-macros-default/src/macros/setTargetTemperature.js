import {
  getHeaterConfigs,
  ComponentTypeEnum,
} from 'tegh-core'

const { BUILD_PLATFORM } = ComponentTypeEnum

const setTargetTemperature = (args, { config }) => {
  const heaters = getHeaterConfigs(config)
  const gcodeLines = []

  Object.entries(args).forEach(([address, v]) => {
    const heater = heaters.get(address)

    if (heater == null) throw new Error(`Heater ${address} does not exist`)
    if (typeof v !== 'number') throw new Error(`${address}: ${v} is not a number`)

    const component = config.printer.components.find(c => c.address === address)

    if (component.type === BUILD_PLATFORM) {
      gcodeLines.push(`M140 S${v}`)
    } else {
      const extruderNumber = parseFloat(address.slice(1))
      gcodeLines.push(`M104 S${v} T${extruderNumber}`)
    }
  })
  return gcodeLines
}

export default setTargetTemperature
