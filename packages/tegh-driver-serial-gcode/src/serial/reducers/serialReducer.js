import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  DRIVER_ERROR,
  ESTOP,
  PRINTER_DISCONNECTED,
  PRINTER_READY,
  printerReady,
} from 'tegh-core'

import serialReceive from '../../serial/actions/serialReceive'
import { SERIAL_SEND } from '../../serial/actions/serialSend'

import greetingDelayDone, { GREETING_DELAY_DONE } from '../actions/greetingDelayDone'

export const initialState = Record({
  serialPort: null,
})()

/*
 * Intercepts DESPOOL actions and sends the current gcode line to the
 * printer.
 *
 * Intercepts SERIAL_RECEIVE actions with the serialReceiveReducer
 */
const serialReducer = (state = initialState, action) => {
  switch (action.type) {
    case CONNECT_PRINTER: {
      return state.set('isConnecting', false)
    }
    case PRINTER_READY: {
      return state.set('isConnecting', true)
    }
    case SERIAL_RECEIVE: {
      if (state.isConnecting === false) return state

      switch (action.payload.type) {
        case 'greeting': {
          return loop(
            Cmd.run(Promise.delay, {
              args: [DELAY_AFTER_GREETING],
              successActionCreator: greetingDelayDone,
            }),
          )
        }
        case 'ok': {
          return loop(
            initialState.set('isConnecting', false),
            Cmd.action(printerReady()),
          )
        }
        default: {
          return state
        }
      }
    }
    case GREETING_DELAY_DONE: {
      if (state.isConnecting === false) return state

      return loop(
        state,
        Cmd.action(serialSend('M110 N0', { lineNumber: false })),
      )
    }
    default: {
      return state
    }
  }
}

export default serialReducer
