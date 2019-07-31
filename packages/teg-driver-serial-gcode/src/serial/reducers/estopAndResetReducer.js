import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  estop,
  connectPrinter,
  printerDisconnected,
  despoolCompleted,
  SET_CONFIG,
  DEVICE_CONNECTED,
  DEVICE_DISCONNECTED,
  DESPOOL_TASK,
  DRIVER_ERROR,
  ESTOP,
  PRINTER_DISCONNECTED,
  PRINTER_READY,
} from '@tegapp/core'

import getSerialPortID from '../selectors/getSerialPortID'

export const initialState = Record({
  estopping: false,
  resetting: false,
  ready: false,
  deviceID: null,
  deviceConnected: false,
})()

const estopAndResetReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      const nextState = state
        .set('deviceID', getSerialPortID(config))

      return nextState
    }
    case DEVICE_CONNECTED:
    case DEVICE_DISCONNECTED: {
      const { device } = action.payload

      if (device.id !== state.deviceID) return state

      return state.set('deviceConnected', action.type === DEVICE_CONNECTED)
    }
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      return state.set('ready', false)
    }
    case PRINTER_READY: {
      return initialState
        .set('estopping', false)
        .set('ready', true)
    }
    case DESPOOL_TASK: {
      const { macro, task } = action.payload

      if (macro === 'eStop') {
        if (state.estopping || state.resetting) return state

        const nextState = state.set('estopping', true)

        return loop(nextState, Cmd.list([
          Cmd.action(estop()),
          Cmd.action(despoolCompleted({ task })),
        ]))
      }

      if (macro === 'reset') {
        if (state.resetting || state.ready) return state

        const nextState = state.set('resetting', true)

        const statusAction = (
          state.deviceConnected ? connectPrinter() : printerDisconnected()
        )

        return loop(nextState, Cmd.list([
          Cmd.action(statusAction),
          Cmd.action(despoolCompleted({ task })),
        ]))
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default estopAndResetReducer
