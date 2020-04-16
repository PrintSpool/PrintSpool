import { List } from 'immutable'

export const CONTROLLER = 'CONTROLLER'
export const AXIS = 'AXIS'
export const TOOLHEAD = 'TOOLHEAD'
export const BUILD_PLATFORM = 'BUILD_PLATFORM'
export const FAN = 'FAN'
export const VIDEO = 'VIDEO'

const ComponentTypeEnum = List([
  CONTROLLER,
  AXIS,
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
  VIDEO,
])

export default ComponentTypeEnum
