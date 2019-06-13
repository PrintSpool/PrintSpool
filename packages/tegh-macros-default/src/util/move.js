import {
  axisExists,
  getComponents,
  AxisTypeEnum,
  ComponentTypeEnum,
} from '@tegh/core'

const { MOVEMENT_AXIS, EXTRUDER_AXIS } = AxisTypeEnum
const { TOOLHEAD } = ComponentTypeEnum

const move = ({
  axes,
  sync,
  relativeMovement,
  allowExtruderAxes,
}, { config }) => {
  // let validAxes = config.axes
  // if (!allowExtruderAxes) {
  //   validAxes = validAxes.filter((axis) => !axis.startsWith('e'))
  // }
  const g1Args = {}
  const feedrates = []

  const allowTypes = [MOVEMENT_AXIS]
  if (allowExtruderAxes) allowTypes.push(EXTRUDER_AXIS)

  Object.entries(axes).forEach(([address, v]) => {
    if (!axisExists(config)(address, { allowTypes })) {
      throw new Error(`Axis ${address} does not exist`)
    }

    // if (!validAxes.includes(id)) throw new Error(`Axis ${id} does not exist`)
    if (typeof v !== 'number') {
      throw new Error(`${address}: ${v} is not a number`)
    }

    // const feedrate = config.feedrates[id]
    // if (feedrate == null) {
    //   throw new Error(`no feedrate configured for ${id}`)
    // }

    // TODO: multi-extruder support
    const component = getComponents(config).find(c => (
      c.model.get('address') === address
    ))
    const isToolhead = component.type === TOOLHEAD

    g1Args[(isToolhead ? 'e' : component.address)] = v

    feedrates.push(component.model.get('feedrate'))
  })

  console.log([
    relativeMovement ? 'G91' : 'G90',
    { g1: { f: Math.min.apply(null, feedrates) * 60 } },
    { g1: g1Args },
    /*
    * Synchronize the end of the task with M400 by waiting until all
    * scheduled movements in the task are finished.
    */
    ...(sync === true ? ['M400'] : []),
  ])
  return [
    relativeMovement ? 'G91' : 'G90',
    { g1: { f: Math.min.apply(null, feedrates) * 60 } },
    { g1: g1Args },
    /*
    * Synchronize the end of the task with M400 by waiting until all
    * scheduled movements in the task are finished.
    */
    ...(sync === true ? ['M400'] : []),
  ]
}

export default move
