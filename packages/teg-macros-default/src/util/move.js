import {
  axisExists,
  getComponents,
  AxisTypeEnum,
  ComponentTypeEnum,
} from '@tegapp/core'
import getMoveComponents from './getMoveComponents'

const { MOVEMENT_AXIS, EXTRUDER_AXIS } = AxisTypeEnum
const { TOOLHEAD } = ComponentTypeEnum

const move = ({
  axes,
  sync,
  relativeMovement,
  allowExtruderAxes,
  machineConfig,
}) => {
  // let validAxes = config.axes
  // if (!allowExtruderAxes) {
  //   validAxes = validAxes.filter((axis) => !axis.startsWith('e'))
  // }
  const g1Args = {}
  const feedrates = []

  getMoveComponents({
    axes,
    allowExtruderAxes,
    machineConfig,
  }).forEach(({ component, address, value }) => {
    if (typeof value !== 'number') {
      throw new Error(`${address}: ${value} is not a number`)
    }

    const isToolhead = component.type === TOOLHEAD

    // TODO: does this work with multi-extruder printers?
    g1Args[(isToolhead ? 'e' : address)] = value

    feedrates.push(component.model.get('feedrate'))
  })

  const commands = [
    relativeMovement ? 'G91' : 'G90',
    { g1: { f: Math.min.apply(null, feedrates) * 60 } },
    { g1: g1Args },
    'G90',
    /*
    * Synchronize the end of the task with M400 by waiting until all
    * scheduled movements in the task are finished.
    */
    ...(sync === true ? ['M400'] : []),
  ]

  return { commands }
}

export default move
