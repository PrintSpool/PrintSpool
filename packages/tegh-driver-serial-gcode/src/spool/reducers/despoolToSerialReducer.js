import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  DESPOOL_TASK,
  requestDespool,
  getCurrentLine,
  isEmergency,
  driverError,
} from 'tegh-server'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'
import serialReceiveReducer from './serialReceiveReducer'

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
      const lineNumber = emergency ? false : state.currentSerialLineNumber

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
        Cmd.run(serialSend, {
          args: [currentLine, { lineNumber }],
        }),
      )
    }
    case SERIAL_SEND: {
      const { lineNumber } = action

      if (typeof lineNumber === 'number') {
        return state.set('currentSerialLineNumber', lineNumber + 1)
      }

      return state
    }
    case SERIAL_RECEIVE: {
      return serialReceiveReducer(state, action)
    }
    default: {
      return state
    }
  }
}

export default despoolToSerialReducer
