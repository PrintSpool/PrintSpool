import { List } from 'immutable'

export const MOVEMENT_AXIS = 'MOVEMENT_AXIS'
export const EXTRUDER_AXIS = 'EXTRUDER_AXIS'

const AxisTypeEnum = List([
  MOVEMENT_AXIS,
  EXTRUDER_AXIS,
])

export default AxisTypeEnum
