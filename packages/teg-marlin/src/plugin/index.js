import { List } from 'immutable'
import { ComponentTypeEnum } from '@tegapp/core'

import getSchemaForms from './getSchemaForms'
import configValidation from './configValidation'

export {
  getSchemaForms,
  configValidation,
}

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
export const macros = () => List([])

export const driver = true
