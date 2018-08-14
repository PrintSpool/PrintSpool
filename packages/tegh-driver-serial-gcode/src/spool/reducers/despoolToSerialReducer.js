import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  SPOOL_TASK,
  DESPOOL_TASK,
  // TODO: create these:
  getCurrentLine,
  shouldSendSpooledLineToPrinter,
  isEmergency,
} from 'tegh-server'

import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'

// const despoolToSerialSaga = () => {
/*
 * Intercepts DESPOOL and SPOOL actions and sends the current gcode line to the
 * printer. Executes after the reducers have resolved which line to send.
 *
 * The first SPOOL action to an idle printer triggers this to begin printing
 * the spooled line.
 */
const despoolToSerialReducer = (state, action) => {
  switch (action.type) {
    case DESPOOL_TASK:
    case SPOOL_TASK: {
      const currentLine = getCurrentLine(state)

      if (
        (action.type === DESPOOL_TASK && currentLine != null)
        || (action.type === SPOOL_TASK && shouldSendSpooledLineToPrinter(state))
      ) {
        const lineNumber = state.currentSerialLineNumber
        const emergency = isEmergency(state)
        /*
         * Send emergency GCodes without line numbers since the printer may be in
         * an unknown state which may include a line number mismatch.
         *
         * M112 Emergency Stops without a line number so that it will
         * be executed by the printer immediately without the opportunity for a
         * line number mismatch to cause an error and potentially prevent the
         * estop.
         */

        return loop(
          state,
          Cmd.run(serialSend, currentLine, {
            lineNumber: emergency ? false : lineNumber,
          }),
        )
      }

      return state
    }
    case SERIAL_SEND: {
      const { lineNumber } = action

      if (typeof lineNumber === 'number') {
        return state.set('currentSerialLineNumber', lineNumber + 1)
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default despoolToSerialReducer
