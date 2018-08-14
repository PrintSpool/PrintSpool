import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'

import {
  SPOOL_TASK,
  ESTOP,
  DRIVER_ERROR,
  PRINTER_READY,
  PriorityEnum,
} from 'tegh-server'

import serialSend from '../../actions/serialSend'
import { throwErrorOnInvalidGCode } from '../../txParser'

const { EMERGENCY } = PriorityEnum

export const ERRORED = 'tegh/printer/status/ERRORED'
export const ESTOPPED = 'tegh/printer/status/ESTOPPED'
export const DISCONNECTED = 'tegh/printer/status/DISCONNECTED'
export const CONNECTING = 'tegh/printer/status/CONNECTING'
export const READY = 'tegh/printer/status/READY'

const initialState = DISCONNECTED

const DELAY_AFTER_GREETING = 50

const statusReducer = (state = initialState, action) => {
  switch (action.type) {
    case DRIVER_ERROR: {
      return ERRORED
    }
    case ESTOP: {
      return ESTOPPED
    }
    case SERIAL_CLOSE: {
      if (action.resetByMiddleware) return state
      return DISCONNECTED
    }
    case SERIAL_OPEN: {
      return CONNECTING
    }
    case PRINTER_READY: {
      return READY
    }
    case SERIAL_RECEIVE: {
      if (state === READY) return

      const responseType = action.data.type

      if (responseType === 'greeting') {
        return loop(
          CONNECTING,
          Cmd.run(Promise.delay, {
            args: [DELAY_AFTER_GREETING],
            successActionCreator: greetingDelayDone,
          }),
        )
      }
      if (responseType === 'ok') {
        return loop(
          state,
          Cmd.action(printerReady()),
        )
      }
      return state
    }
    case GREETING_DELAY_DONE: {
      if (state !== CONNECTING) return state
      return loop(
        state,
        Cmd.action(serialSend('M110 N0', { lineNumber: false })),
      )
    }
    case SPOOL_TASK: {
      if (
        state.status !== READY &&
        action.payload.task.priority !== EMERGENCY
      ) {
        const err = (
          'Only emergency tasks can be spooled when the machine is not ready.'
        )
        throw new Error(err)
      }
      throwErrorOnInvalidGCode(action.payload.task.data)
      return state
    }
    default: {
      return state
    }
  }
}

export default statusReducer
