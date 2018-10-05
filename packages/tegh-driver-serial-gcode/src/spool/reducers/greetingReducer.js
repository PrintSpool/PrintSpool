import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  DRIVER_ERROR,
  ESTOP,
  PRINTER_DISCONNECTED,
  CONNECT_PRINTER,
  printerReady,
} from 'tegh-core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend from '../../serial/actions/serialSend'

import greetingDelayDone, { GREETING_DELAY_DONE } from '../actions/greetingDelayDone'

export const initialState = Record({
  delayAfterGreeting: 50,
  isConnecting: false,
})()

/*
 * Intercepts DESPOOL actions and sends the current gcode line to the
 * printer.
 *
 * Intercepts SERIAL_RECEIVE actions with the serialReceiveReducer
 */
const greetingReducer = (state = initialState, action) => {
  switch (action.type) {
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      return state.set('isConnecting', false)
    }
    case CONNECT_PRINTER: {
      return state.set('isConnecting', true)
    }
    case SERIAL_RECEIVE: {
      if (state.isConnecting === false) return state

      switch (action.payload.type) {
        case 'greeting': {
          return loop(
            state,
            Cmd.run(Promise.delay, {
              args: [state.delayAfterGreeting],
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

export default greetingReducer
