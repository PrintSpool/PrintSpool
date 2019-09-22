import { List } from 'immutable'
import { ComponentTypeEnum } from '@tegapp/core'

const {
  CONTROLLER,
  AXIS,
  BUILD_PLATFORM,
} = ComponentTypeEnum

export const fixedListComponentTypes = List([
  CONTROLLER,
  AXIS,
  BUILD_PLATFORM,
])

export const logReducer = () => null
export const reducer = () => {}
export const macros = List([])

export getSchemaForms from './getSchemaForms'

export configValidation from './configValidation'

export const driver = true
