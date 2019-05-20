import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  DESPOOL_TASK,
  getCurrentLine,
  isEmergency,
  driverError,
  parseGCode,
  despoolCompleted,
} from '@tegh/core'

import { SERIAL_CLOSE } from '../../serial/actions/serialClose'
import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'

export const REQUEST_DESPOOL_ON_OK = 'REQUEST_DESPOOL_ON_OK'
export const RESEND_ON_OK = 'RESEND_ON_OK'
export const IGNORE_OK = 'IGNORE_OK'

export const initialState = Record({
  onNextOK: REQUEST_DESPOOL_ON_OK,
  currentSerialLineNumber: 1,
  lastTaskSent: null,
})()

/*
 * Intercepts DESPOOL actions and sends the current gcode line to the
 * printer.
 *
 * Intercepts SERIAL_RECEIVE actions with the serialReceiveReducer
 */
const despoolToSerialReducer = (state = initialState, action) => {
  switch (action.type) {
    case DESPOOL_TASK: {
      const { task, isHostMacro, createdAt } = action.payload

      const { isPollingRequest } = task

      if (isHostMacro) return state

      const emergency = isEmergency.resultFunc(task)
      const currentLine = getCurrentLine.resultFunc(task)

      /*
       * Send emergency GCodes without line numbers since the printer may be in
       * an unknown state which may include a line number mismatch.
       *
       * M112 Emergency Stops without a line number so that it will
       * be executed by the printer immediately without the opportunity for a
       * line number mismatch to cause an error and potentially prevent the
       * estop.
       */
      const lineNumber = emergency ? false : state.currentSerialLineNumber

      const nextState = state.set('lastTaskSent', task)

      return loop(
        nextState,
        Cmd.action(serialSend({
          ...parseGCode(currentLine),
          createdAt,
          lineNumber,
          isPollingRequest,
        })),
      )
    }
    case SERIAL_CLOSE: {
      return state.set('currentSerialLineNumber', 1)
    }
    case SERIAL_SEND: {
      const { lineNumber } = action.payload

      if (typeof lineNumber !== 'number') return state

      return state.set('currentSerialLineNumber', lineNumber + 1)
    }
    case SERIAL_RECEIVE: {
      const { payload } = action
      const task = state.lastTaskSent

      switch (payload.type) {
        case 'ok': {
          switch (state.onNextOK) {
            case REQUEST_DESPOOL_ON_OK: {
              return loop(
                state,
                Cmd.action(despoolCompleted()),
              )
            }

            case RESEND_ON_OK: {
              const previousSerialLineNumber = state.currentSerialLineNumber - 1

              const currentLine = getCurrentLine.resultFunc(task)

              const nextState = state
                .set('onNextOK', IGNORE_OK)

              const nextAction = serialSend({
                ...parseGCode(currentLine),
                lineNumber: previousSerialLineNumber,
              })

              return loop(
                nextState,
                Cmd.action(nextAction),
              )
            }

            case IGNORE_OK: {
              return state.set('onNextOK', REQUEST_DESPOOL_ON_OK)
            }

            default: {
              throw new Error(`Invalid onNextOK state: ${state.onNextOK}`)
            }
          }
        }
        case 'resend': {
          const previousSerialLineNumber = state.currentSerialLineNumber - 1

          /*
           * Tegh only sends one line at a time. If a resend is requested for a
           * different line number then this is likely an issue of the printer's
           * firmware.
           */
          if (payload.lineNumber !== previousSerialLineNumber) {
            throw new Error(
              `resend line number ${payload.lineNumber} does not `
              + `match previous line number ${previousSerialLineNumber}`,
            )
          }
          // wait for the ok sent after the resend (see marlinFixture.js)
          return state
            .set('onNextOK', RESEND_ON_OK)
        }
        case 'error': {
          let { message } = action.payload
          if (task != null) {
            message = `${task.name}:${task.currentLineNumber}: ${message}`
          }
          const errorAction = driverError({
            code: 'FIRMWARE_ERROR',
            message,
          })

          return loop(state, Cmd.action(errorAction))
        }
        default: {
          return state
        }
      }
    }
    default: {
      return state
    }
  }
}

export default despoolToSerialReducer
