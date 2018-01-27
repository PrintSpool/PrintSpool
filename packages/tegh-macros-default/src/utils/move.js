import _ from 'lodash'

const move = ({ axes, relativeMovement, allowExtruderAxes }, config) => {
  let validAxes = config.axes
  if (!allowExtruderAxes) {
    validAxes = validAxes.filter((axis) => !axis.startsWith('e'))
  }
  const gcodeWords = ['G1']
  const feedrates = []

  Object.entries(axes).forEach(([id, v]) => {
    if (!validAxes.includes(id)) throw new Error(`Axis ${id} does not exist`)
    if(typeof(v) !== 'number') throw new Error(`${id}: ${v} is not a number`)
    const feedrate= config.feedrates[id]
    if (feedrate == null) {
      throw new Error(`no feedrate configured for ${id}`)
    }
    // TODO: multi-extruder support
    gcodeWords.push(`${(id.startsWith('e') ? 'e' : id).toUpperCase()}${v}`)
    feedrates.push(feedrate)
  })
  return [
    relativeMovement ? 'G91' : 'G90',
    `G1 F${_.min(feedrates) * 60}`,
    gcodeWords.join(' '),
  ]
}

export default move
