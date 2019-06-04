import {
  axisExists,
  getComponents,
  AxisTypeEnum,
  ComponentTypeEnum,
} from '@tegh/core'

const { MOVEMENT_AXIS, EXTRUDER_AXIS } = AxisTypeEnum
const { TOOLHEAD } = ComponentTypeEnum

const move = ({ axes, relativeMovement, allowExtruderAxes }, { config }) => {
  // let validAxes = config.axes
  // if (!allowExtruderAxes) {
  //   validAxes = validAxes.filter((axis) => !axis.startsWith('e'))
  // }
  const g1Args = {}
  const feedrates = []

  const allowTypes = [MOVEMENT_AXIS]
  if (allowExtruderAxes) allowTypes.push(EXTRUDER_AXIS)

  Object.entries(axes).forEach(([id, v]) => {
    if (!axisExists(config)(id, { allowTypes })) {
      throw new Error(`Axis ${id} does not exist`)
    }

    // if (!validAxes.includes(id)) throw new Error(`Axis ${id} does not exist`)
    if (typeof v !== 'number') throw new Error(`${id}: ${v} is not a number`)

    // const feedrate = config.feedrates[id]
    // if (feedrate == null) {
    //   throw new Error(`no feedrate configured for ${id}`)
    // }

    // TODO: multi-extruder support
    const component = getComponents(config).get(id)
    const isToolhead = component.type === TOOLHEAD

    g1Args[(isToolhead ? 'e' : component.address)] = v

    feedrates.push(component.model.get('feedrate'))
  })

  return [
    relativeMovement ? 'G91' : 'G90',
    { g1: { f: Math.min.apply(null, feedrates) * 60 } },
    { g1: g1Args },
  ]
}

export default move
