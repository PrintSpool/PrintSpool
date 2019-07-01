import { createSelector } from 'reselect'
import getComponentsByType from './getComponentsByType'
import { CONTROLLER } from '../types/components/ComponentTypeEnum'

import Device from '../../devices/types/Device'
import { SERIAL_PORT } from '../../devices/types/DeviceTypeEnum'

const getConfiguredDevices = createSelector(
  getComponentsByType,
  (components) => {
    const controllers = components.get(CONTROLLER)

    const configuredDevices = controllers
      .toList()
      .map((controller) => {
        const serialPortID = controller.model.get('serialPortID')
        if (serialPortID == null) return null
        return Device({
          id: serialPortID,
          type: SERIAL_PORT,
          connected: false,
        })
      })
      .filter(device => device != null)

    return configuredDevices
  },
)

export default getConfiguredDevices
