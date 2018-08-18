import { List } from 'immutable'

export const MOVEMENT_AXIS = 'MOVEMENT_AXIS'
export const EXTRUDER_AXIS = 'EXTRUDER_AXIS'

const axisTypeEnum = List([
  MOVEMENT_AXIS,
  EXTRUDER_AXIS,
])

export default axisTypeEnum
