import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  SET_CONFIG,
  getController,
  DeviceTypeEnum,
  deviceConnected,
  deviceDisconnected,
  Device,
} from '@tegh/core'

import getSerialPortID from '../selectors/getSerialPortID'

const { SERIAL_PORT } = DeviceTypeEnum

export const initialState = Record({
  isConnected: false,
  device: null,
})()

const simulatedDeviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const controllerConfig = getController(config).model
      const serialPortID = getSerialPortID(config)
      const simulate = controllerConfig.get('simulate')

      if (simulate === true && state.isConnected === false) {
        const device = Device({
          id: serialPortID,
          type: SERIAL_PORT,
          connected: true,
          simulated: true,
        })

        const nextState = state.merge({
          isConnected: true,
          device,
        })

        return loop(
          nextState,
          Cmd.action(deviceConnected({ device })),
        )
      }
      if (simulate === false && state.isConnected === true) {
        const { device } = state

        return loop(
          initialState,
          Cmd.action(deviceDisconnected({ device })),
        )
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default simulatedDeviceReducer
