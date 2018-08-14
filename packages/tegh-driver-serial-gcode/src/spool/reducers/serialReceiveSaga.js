import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  driverError,
  despoolTask,
} from 'tegh-server'

import serialSend from '../../actions/serialSend'

export const initialState = Record({
  ignoreOK: false,
  resendLineNumberOnOK: null,
})()

export const IGNORE_CURRENT = 'IGNORE_CURRENT'
export const IGNORE_NEXT = 'IGNORE_NEXT'

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

  const { data } = action

  switch (data.type) {
    case 'ok': {
      if (state.ignoreOK === IGNORE_NEXT) {
        const currentLine = getCurrentLine(state)

        const nextState = initialState.set('ignoreOK', IGNORE_CURRENT)

        return loop(nextState, Cmd.action(serialSend(currentLine, {
          lineNumber: state.resendLineNumberOnOK,
        })))
      }

      if (state.ignoreOK === IGNORE_CURRENT) {
        return state.set('ignoreOK', false)
      }

      return loop(state, Cmd.action(despoolTask()))
    }
    case 'resend': {
      const currentSerialLineNumber = getCurrentSerialLineNumber(state)
      const previousSerialLineNumber = currentSerialLineNumber - 1

      /*
       * Tegh only sends one line at a time. If a resend is requested for a
       * different line number then this is likely an issue of the printer's
       * firmware.
       */
      if (data.lineNumber !== previousSerialLineNumber) {
        throw new Error(
          `resend line number ${data.lineNumber} `+
          `does not match previous line number ${previousSerialLineNumber}`
        )
      }

      // wait for the ok sent after the resend (see marlinFixture.js)
      return state.merge({
        ignoreOK: IGNORE_NEXT,
        resendLineNumberOnOK: previousSerialLineNumber
      })
    }
    case 'error': {
      const fileName = getCurrentFileName(state)
      const fileLineNumber = getCurrentFileLineNumber(state)

      const error = driverError({
        code: 'FIRMWARE_ERROR',
        message: `${fileName}:${fileLineNumber}: ${action.data.raw}`,
      })
      return loop(state, Cmd.action(error))
    }
    default: {
      return state
    }
  }
}

export default serialReceiveSaga
