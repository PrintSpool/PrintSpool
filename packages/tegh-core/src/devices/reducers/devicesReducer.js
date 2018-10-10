import { loop, Cmd } from 'redux-loop'
import { Map, Record } from 'immutable'

import watchSerialPorts from '../sideEffects/watchSerialPorts'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { DEVICE_CONNECTED } from '../actions/deviceConnected'
import { DEVICE_DISCONNECTED } from '../actions/deviceDisconnected'

export const initialState = Record({
  initialized: false,
  byID: Map(),
})()

const devicesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      if (state.initialized) return state

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
      // console.log('CONNECT', device.id)

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
