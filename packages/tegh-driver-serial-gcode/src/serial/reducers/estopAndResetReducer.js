import { loop, Cmd } from 'redux-loop'

import {
  connectPrinter,
  estop,
} from 'tegh-core'

import { SERIAL_SEND } from '../actions/serialSend'
import serialReset from '../actions/serialReset'

export const initialState = null

const estopAndResetReducer = (state = initialState, action) => {
  switch (action.type) {
    case SERIAL_SEND: {
      const { code } = action.payload
      /*
       * Trigger an eStop action on M112 to emergency stop all of Tegh
       */
      if (code === 'M112') {
        return loop(state, Cmd.action(estop()))
      }
      /*
       * eStops require a reset of the serial connection
       * to restart the printer so we automatically do this for all M999s just to
       * be safe.
       */
      if (code === 'M999') {
        return loop(state, Cmd.action(serialReset()))
      }
      return state
    }
    default: {
      return state
    }
  }
}

export default estopAndResetReducer
