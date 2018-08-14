import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  driverError,
  despoolTask,
  getCurrentLine,
  getCurrentFileName,
  getCurrentFileLineNumber,
} from 'tegh-server'

import serialSend from '../../serial/actions/serialSend'
import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'

export const initialState = Record({
  ignoreOK: false,
  resendLineNumberOnOK: null,
  error: null,
  currentSerialLineNumber: 1,
})()

/*
 * Intercepts SERIAL_RECEIVE actions
 *
 * - dispatches DESPOOL on acknowledgment of previous line.
 * - dispatches SERIAL_SEND to resend the previous line if the printer
 *   requests a resend.
 * - dispatches DRIVER_ERROR for serial receive parser errors
 */
const serialReceiveSaga = (state = initialState, action) => {
  if (action.type !== SERIAL_RECEIVE) return state

  const data = action.payload

  switch (data.type) {
    case 'ok': {
      if (state.resendLineNumberOnOK != null) {
        const currentLine = getCurrentLine(state)

        const nextState = initialState.set('ignoreOK', true)

        return loop(nextState, Cmd.action(serialSend(currentLine, {
          lineNumber: state.resendLineNumberOnOK,
        })))
      }

      if (state.ignoreOK === true) {
        return state.set('ignoreOK', false)
      }

      return loop(state, Cmd.action(despoolTask()))
    }
    case 'resend': {
      const previousSerialLineNumber = state.currentSerialLineNumber - 1

      /*
       * Tegh only sends one line at a time. If a resend is requested for a
       * different line number then this is likely an issue of the printer's
       * firmware.
       */
      if (data.lineNumber !== previousSerialLineNumber) {
        throw new Error(
          `resend line number ${data.lineNumber} `
          + `does not match previous line number ${previousSerialLineNumber}`,
        )
      }

      // wait for the ok sent after the resend (see marlinFixture.js)
      return initialState.merge({
        resendLineNumberOnOK: previousSerialLineNumber,
      })
    }
    case 'error': {
      const fileName = getCurrentFileName(state)
      const fileLineNumber = getCurrentFileLineNumber(state)

      const errorAction = driverError({
        code: 'FIRMWARE_ERROR',
        message: `${fileName}:${fileLineNumber}: ${action.data.raw}`,
      })

      const nextState = state.set('error', errorAction.error)
      return loop(nextState, Cmd.action(errorAction))
    }
    default: {
      return state
    }
  }
}

export default serialReceiveSaga
