import _ from 'lodash'
import {
  axisExists,
  getComponents,
  AxisTypeEnum,
  ComponentTypeEnum,
} from 'tegh-core'

const { MOVEMENT_AXIS, EXTRUDER_AXIS } = AxisTypeEnum
const { TOOLHEAD } = ComponentTypeEnum

const move = ({ axes, relativeMovement, allowExtruderAxes }, { config }) => {
  // let validAxes = config.axes
  // if (!allowExtruderAxes) {
  //   validAxes = validAxes.filter((axis) => !axis.startsWith('e'))
  // }
  const gcodeWords = ['G1']
  const feedrates = []

  const allowTypes = [MOVEMENT_AXIS]
  if (allowExtruderAxes) allowTypes.push(EXTRUDER_AXIS)

  Object.entries(axes).forEach(([address, v]) => {
    if (!axisExists(config)(address, { allowTypes })) {
      throw new Error(`Axis ${address} does not exist`)
    }

    // if (!validAxes.includes(address)) throw new Error(`Axis ${address} does not exist`)
    if (typeof v !== 'number') throw new Error(`${address}: ${v} is not a number`)

    // const feedrate = config.feedrates[address]
    // if (feedrate == null) {
    //   throw new Error(`no feedrate configured for ${address}`)
    // }

    // TODO: multi-extruder support
    const component = getComponents(config).find(c => (
      c.model.get('address') === address
    ))
    const isToolhead = component.type === TOOLHEAD

    gcodeWords.push(`${(isToolhead ? 'e' : address).toUpperCase()}${v}`)

    feedrates.push(component.feedrate)
  })
  console.log({ feedrates })
  return [
    relativeMovement ? 'G91' : 'G90',
    `G1 F${_.min(feedrates) * 60}`,
    gcodeWords.join(' '),
  ]
}

export default move
