import { loop, Cmd } from 'redux-loop'
import { Map, Record } from 'immutable'

import watchSerialPorts from '../sideEffects/watchSerialPorts'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { PRINTER_DISCONNECTED } from '../../printer/actions/printerDisconnected'
import { DEVICE_CONNECTED } from '../actions/deviceConnected'
import { DEVICE_DISCONNECTED } from '../actions/deviceDisconnected'

export const initialState = Record({
  initialized: false,
  byID: Map(),
})()

const devicesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG:
    case PRINTER_DISCONNECTED: {
      const isConfigError = (
        action.type === SET_CONFIG && action.payload.error != null
      )

      if (state.initialized || isConfigError) return state

      const nextState = state.set('initialized', true)

      return loop(
        nextState,
        Cmd.run(watchSerialPorts, {
          args: [Cmd.getState, Cmd.dispatch],
        }),
      )
    }
    case DEVICE_CONNECTED: {
      const { device } = action.payload

      return state.setIn(['byID', device.id], device)
    }
    case DEVICE_DISCONNECTED: {
      const { device } = action.payload
      // console.log('DISCONNECT', device.id)

      return state.removeIn(['byID', device.id])
    }
    default: {
      return state
    }
  }
}

export default devicesReducer
