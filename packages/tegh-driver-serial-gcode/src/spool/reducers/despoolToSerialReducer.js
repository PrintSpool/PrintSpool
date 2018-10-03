import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  DESPOOL_TASK,
  getCurrentLine,
  isEmergency,
  requestDespool,
  driverError,
} from 'tegh-core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'

export const initialState = Record({
  ignoreOK: false,
  resendLineNumberOnOK: null,
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
      const { task } = action.payload

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

      return loop(
        state,
        Cmd.action(serialSend(currentLine, { lineNumber })),
      )
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
          if (state.resendLineNumberOnOK != null) {
            const currentLine = getCurrentLine.resultFunc(task)

            const nextState = state
              .set('resendLineNumberOnOK', null)
              .set('ignoreOK', true)

            return loop(nextState, Cmd.action(serialSend(currentLine, {
              lineNumber: state.resendLineNumberOnOK,
            })))
          }

          if (state.ignoreOK === true) {
            return state.set('ignoreOK', false)
          }

          return loop(state, Cmd.action(requestDespool()))
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
          return state.set('resendLineNumberOnOK', previousSerialLineNumber)
        }
        case 'error': {
          const errorAction = driverError({
            code: 'FIRMWARE_ERROR',
            message: (
              `${task.name}:${task.currentLineNumber}: ${action.payload.raw}`
            ),
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
