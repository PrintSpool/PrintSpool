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
  TOOLHEAD,
} = ComponentTypeEnum

export const fixedListComponentTypes = List([
  CONTROLLER,
  AXIS,
  BUILD_PLATFORM,
  // TODO: multi-extruder support.
  // Getting this working will require someone with access to a multi-extruder 3D printer to debug
  // it. Comment out the next line to re-enable the current non-functional multi-extruder support.
  TOOLHEAD,
])

export const logReducer = () => null
export const macros = []
export const configuredDevices = ({ machineConfig }) => {
  const controller = machineConfig.components.find(c => c.type === 'CONTROLLER')
  const deviceID = controller.model.get('serialPortID')
  return [deviceID]
}

export const driver = true
