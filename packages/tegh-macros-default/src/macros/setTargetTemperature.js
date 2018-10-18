import {
  getHeaterConfigs,
  isHeatedBed,
} from 'tegh-core'

const setTargetTemperature = (args, { config }) => {
  const heaters = getHeaterConfigs(config)
  const gcodeLines = []

  Object.entries(args).forEach(([k, v]) => {
    const heater = heaters.get(k)

    if (heater == null) throw new Error(`Heater ${k} does not exist`)
    if (typeof v !== 'number') throw new Error(`${k}: ${v} is not a number`)

    if (isHeatedBed(config)(k)) {
      gcodeLines.push(`M140 S${v}`)
    } else {
      const extruderNumber = parseFloat(k.slice(1))
      gcodeLines.push(`M104 S${v} T${extruderNumber}`)
    }
  })
  return gcodeLines
}

export default setTargetTemperature
