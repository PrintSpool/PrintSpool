import {
  getHeaterConfigs,
  isHeatedBed,
} from 'tegh-server'

const setTemperature = (args, config) => {
  const heaters = getHeaterConfigs(config)
  const gcodeLines = []
  let extruderWasEnabled = false

  Object.entries(args).forEach(([k, v]) => {
    const heater = heaters.get(k)

    if (heater == null) throw new Error(`Heater ${k} does not exist`)
    if(typeof(v) !== 'number') throw new Error(`${k}: ${v} is not a number`)

    if (isHeatedBed(config)(k)) {
      gcodeLines.push(`M140 S${v}`)
    } else {
      if (v > 0)
        if (extruderWasEnabled) {
          throw new Error('Only one extruder can be enabled at a time')
        }
        extruderWasEnabled = true
      }

      const extruderNumber = parseFloat(k.slice(1))
      const pSuffix = extruderNumber > 0 ? ` P${extruderNumber}` : ''
      gcodeLines.push(`M104 S${v}${pSuffix}`)
    }
  })
  return gcodeLines
}

export default setTemperature
