import { loop, Cmd } from 'redux-loop'

import {
  requestDespool,
  getCurrentLine,
  driverError,
} from 'tegh-core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend from '../../serial/actions/serialSend'

/*
 * See despoolToSerialReducer for state shape
 *
 * Intercepts SERIAL_RECEIVE actions:
 *
 * - dispatches DESPOOL on acknowledgment of previous line.
 * - dispatches SERIAL_SEND to resend the previous line if the printer
 *   requests a resend.
 * - dispatches DRIVER_ERROR for serial receive parser errors
 */
const despoolToSerialReducer = (state, action) => {
  switch (action.type) {
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
