import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  SPOOL_TASK,
  ESTOP,
  DRIVER_ERROR,
  printerReady,
  PriorityEnum,
} from 'tegh-server'

import serialSend from '../../../serial/actions/serialSend'
import { SERIAL_OPEN } from '../../../serial/actions/serialOpen'
import { SERIAL_CLOSE } from '../../../serial/actions/serialClose'
import { SERIAL_RECEIVE } from '../../../serial/actions/serialReceive'
import greetingDelayDone, { GREETING_DELAY_DONE } from '../actions/greetingDelayDone'

import { throwErrorOnInvalidGCode } from '../../../txParser'

import {
  ERRORED,
  ESTOPPED,
  DISCONNECTED,
  CONNECTING,
  READY,
} from '../types/statusEnum'

const { EMERGENCY } = PriorityEnum

const initialState = Record({
  status: DISCONNECTED,
  error: null,
})()

const DELAY_AFTER_GREETING = 50

const statusReducer = (state = initialState, action) => {
  switch (action.type) {
    case DRIVER_ERROR: {
      return initialState
        .set('status', ERRORED)
        .set('error', action.payload)
    }
    case ESTOP: {
      return initialState.set('status', ESTOPPED)
    }
    case SERIAL_CLOSE: {
      if (action.payload.resetByMiddleware) return state
      return initialState.set('status', DISCONNECTED)
    }
    case SERIAL_OPEN: {
      return initialState.set('status', CONNECTING)
    }
    case SERIAL_RECEIVE: {
      if (state.status === READY) return

      const responseType = action.payload.type

      if (responseType === 'greeting') {
        return loop(
          initialState.set('status', CONNECTING),
          Cmd.run(Promise.delay, {
            args: [DELAY_AFTER_GREETING],
            successActionCreator: greetingDelayDone,
          }),
        )
      }
      if (responseType === 'ok') {
        return loop(
          initialState.set('status', READY),
          Cmd.action(printerReady()),
        )
      }
      return state
    }
    case GREETING_DELAY_DONE: {
      if (state.status !== CONNECTING) return state
      return loop(
        state,
        Cmd.action(serialSend('M110 N0', { lineNumber: false })),
      )
    }
    case SPOOL_TASK: {
      if (
        state.status !== READY
        && action.payload.task.priority !== EMERGENCY
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
