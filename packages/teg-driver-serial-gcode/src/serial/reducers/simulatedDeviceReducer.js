import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  SET_CONFIG,
  CONNECT_PRINTER,
  getController,
  DeviceTypeEnum,
  deviceConnected,
  deviceDisconnected,
  Device,
} from '@tegapp/core'

import getSerialPortID from '../selectors/getSerialPortID'

const { SERIAL_PORT } = DeviceTypeEnum

export const initialState = Record({
  isConnected: false,
  device: null,
  config: null,
  initialized: false,
})()

const simulatedDeviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG:
    case CONNECT_PRINTER: {
      const isConfigError = (
        action.type === SET_CONFIG && action.payload.error != null
      )

      let nextState = state
      if (action.type === SET_CONFIG) {
        nextState = state.set('config', action.payload.config)
      }

      if (state.initialized || isConfigError) {
        return nextState
      }

      nextState = nextState.set('initialized', true)
      const { config } = nextState

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

        nextState = nextState.merge({
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
          initialState.set('config', config),
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
