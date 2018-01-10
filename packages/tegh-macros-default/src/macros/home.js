const home = (args, config) => {
  const validAxes = config.axes.filter((axis) => !axis.startsWith('e'))

  if (args.all === true) return ['G28']
  if (!Array.isArray(args) || args.length === 0) {
    throw new Error(
      `args must either be an array or axis names or {all: true}`
    )
  }

  const gcodeWords = ['G28']
  args.forEach(([k]) => {
    if (!validAxes.includes(k)) throw new Error(`Axis ${k} does not exist`)
    gcodeWords.push(k.toUpperCase())
  })
  return [
    gcodeWords.join(' '),
  ]
}

export default home
