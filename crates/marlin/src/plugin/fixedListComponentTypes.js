import { List } from 'immutable'
import { ComponentTypeEnum } from '@tegapp/core'

const {
  CONTROLLER,
  AXIS,
  BUILD_PLATFORM,
} = ComponentTypeEnum

const fixedListComponentTypes = List([
  CONTROLLER,
  AXIS,
  BUILD_PLATFORM,
])

export default fixedListComponentTypes
