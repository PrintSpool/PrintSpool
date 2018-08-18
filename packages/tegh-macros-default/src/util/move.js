import _ from 'lodash'
import {
  axisExists,
  getFeedrate,
  axisTypeEnum,
} from 'tegh-server'

const { MOVEMENT_AXIS, EXTRUDER_AXIS } = axisTypeEnum

const move = ({ axes, relativeMovement, allowExtruderAxes }, config) => {
  // let validAxes = config.axes
  // if (!allowExtruderAxes) {
  //   validAxes = validAxes.filter((axis) => !axis.startsWith('e'))
  // }
  const gcodeWords = ['G1']
  const feedrates = []

  const allowTypes = [MOVEMENT_AXIS]
  if (allowExtruderAxes) allowTypes.push(EXTRUDER_AXIS)

  Object.entries(axes).forEach(([id, v]) => {
    if (!axisExists(config)(id, { allowTypes })) {
      throw new Error(`Axis ${id} does not exist`)
    }

    // if (!validAxes.includes(id)) throw new Error(`Axis ${id} does not exist`)
    if(typeof(v) !== 'number') throw new Error(`${id}: ${v} is not a number`)

    // const feedrate = config.feedrates[id]
    // if (feedrate == null) {
    //   throw new Error(`no feedrate configured for ${id}`)
    // }

    // TODO: multi-extruder support
    gcodeWords.push(`${(isExtruder(config)(id) ? 'e' : id).toUpperCase()}${v}`)

    feedrates.push(getFeedrate(config)(id))
  })
  return [
    relativeMovement ? 'G91' : 'G90',
    `G1 F${_.min(feedrates) * 60}`,
    gcodeWords.join(' '),
  ]
}

export default move
