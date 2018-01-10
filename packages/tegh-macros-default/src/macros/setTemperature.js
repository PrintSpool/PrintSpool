const setTemperature = (args, config) => {
  const heaters = config.axes.filter((axis) => axis.startsWith('e'))
  heaters.push('b')
  const gcodeLines = []

  Object.entries(args).forEach(([k, v]) => {
    if (!heaters.includes(k)) throw new Error(`Axis ${k} does not exist`)
    if(typeof(v) !== 'number') throw new Error(`${k}: ${v} is not a number`)
    if (k === 'b') {
      gcodeLines.push(`M140 S${v}`)
    } else {
      const extruderNumber = parseFloat(k.slice(1))
      const pSuffix = extruderNumber > 0 ? ` P${extruderNumber}` : ''
      gcodeLines.push(`M104 S${v}${pSuffix}`)
    }
  })
  return gcodeLines
}

export default setTemperature
