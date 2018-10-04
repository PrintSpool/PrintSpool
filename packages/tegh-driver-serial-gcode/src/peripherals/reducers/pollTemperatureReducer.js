import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'

import {
  PRINTER_READY,
} from 'tegh-core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import spoolTemperatureQuery from '../actions/spoolTemperatureQuery'

import getPollingInterval from '../../config/selectors/getPollingInterval'

export const initialState = null

const pollTemperatureReducer = (state = initialState, action) => {
  switch (action.type) {
    case SERIAL_RECEIVE: {
      const { config } = action
      const data = action.payload

      // if it has temperature data
      if (
        data
        && data.type === 'ok'
        && data.temperatures != null
      ) {
        const interval = getPollingInterval(config)
        return loop(
          state,
          Cmd.run(Promise.delay, {
            args: [interval],
            successActionCreator: spoolTemperatureQuery,
          }),
        )
      }
      return state
    }
    case PRINTER_READY: {
      /*
       * TODO: this will fail if the printer is no longer 'ready' when
       * the temperature query is sent. Find a way to suppress that error.
       * Possibly using Cmd.run, failureActionCreator and Cmd.dispatch will
       * resolve this.
       */
      return loop(state, Cmd.action(spoolTemperatureQuery()))
    }
    default: {
      return state
    }
  }
}

export default pollTemperatureReducer
