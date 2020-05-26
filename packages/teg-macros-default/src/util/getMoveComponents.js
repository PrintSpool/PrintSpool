import {
  axisExists,
  getComponents,
  AxisTypeEnum,
} from '@tegapp/core'

const { MOVEMENT_AXIS, EXTRUDER_AXIS } = AxisTypeEnum

const getMoveComponents = ({
  axes,
  allowExtruderAxes,
  machineConfig,
}) => {
  const allowTypes = [MOVEMENT_AXIS]
  if (allowExtruderAxes) allowTypes.push(EXTRUDER_AXIS)

  return Object.entries(axes).map(([address, value]) => {
    if (!axisExists(machineConfig)(address, { allowTypes })) {
      throw new Error(`Axis ${address} does not exist`)
    }

    const component = getComponents(machineConfig).find(c => (
      c.model.get('address') === address
    ))

    return { component, address, value }
  })
}

export default getMoveComponents
