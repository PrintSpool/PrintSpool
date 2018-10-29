import { List } from 'immutable'

export const CONTROLLER = 'CONTROLLER'
export const TOOLHEAD = 'TOOLHEAD'
export const BUILD_PLATFORM = 'BUILD_PLATFORM'
export const FAN = 'FAN'

const PeripheralTypeEnum = List([
  CONTROLLER,
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
])

export default PeripheralTypeEnum