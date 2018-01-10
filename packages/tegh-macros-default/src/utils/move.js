const move = ({axes, relativeMovement}, config) => {
  const validAxes = config.axes.filter((axis) => !axis.startsWith('e'))
  const gcodeWords = ['G1']

  Object.entries(axes).forEach(([k, v]) => {
    if (!validAxes.includes(k)) throw new Error(`Axis ${k} does not exist`)
    if(typeof(v) !== 'number') throw new Error(`${k}: ${v} is not a number`)
    gcodeWords.push(`${k.toUpperCase()}${v}`)
  })
  return [
    relativeMovement ? 'G91' : 'G90',
    gcodeWords.join(' '),
  ]
}

export default move
