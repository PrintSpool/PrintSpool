import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  DRIVER_ERROR,
  ESTOP,
  PRINTER_DISCONNECTED,
  SET_CONFIG,
  printerReady,
  getController,
} from '@tegh/core'

import { SERIAL_OPEN } from '../../serial/actions/serialOpen'
import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend from '../../serial/actions/serialSend'

import greetingDelayDone, { GREETING_DELAY_DONE } from '../actions/greetingDelayDone'

export const initialState = Record({
  awaitGreetingFromFirmware: null,
  delayFromGreetingToReady: null,
  isConnecting: false,
  awaitingGreeting: false,
})()

/*
 * Intercepts DESPOOL actions and sends the current gcode line to the
 * printer.
 *
 * Intercepts SERIAL_RECEIVE actions with the serialReceiveReducer
 */
const greetingReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const { model } = getController(config)
      return state
        .set(
          'delayFromGreetingToReady',
          model.get('delayFromGreetingToReady'),
        )
        .set(
          'awaitGreetingFromFirmware',
          model.get('awaitGreetingFromFirmware'),
        )
    }
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      return state.set('isConnecting', false)
    }
    case SERIAL_OPEN: {
      const nextState = state
        .set('isConnecting', true)
        .set('awaitingGreeting', state.awaitGreetingFromFirmware)

      if (state.awaitGreetingFromFirmware) return nextState

      return loop(
        nextState,
        Cmd.action(serialSend({
          macro: 'M110',
          args: { N: '0' },
          lineNumber: false,
        })),
      )
    }
    case SERIAL_RECEIVE: {
      if (state.isConnecting === false) return state

      switch (action.payload.type) {
        case 'greeting': {
          if (state.awaitingGreeting === false) return state

          return loop(
            state.set('awaitingGreeting', false),
            Cmd.run(Promise.delay, {
              args: [state.delayFromGreetingToReady],
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
        Cmd.action(serialSend({
          macro: 'M110',
          args: { n: 0 },
          lineNumber: false,
        })),
      )
    }
    default: {
      return state
    }
  }
}

export default greetingReducer
