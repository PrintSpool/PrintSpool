import { Record } from 'immutable'
import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'

import {
  DRIVER_ERROR,
  ESTOP,
  PRINTER_DISCONNECTED,
  PRINTER_READY,
  SET_CONFIG,
  spoolTask,
  PriorityEnum,
} from 'tegh-core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import requestTemperatureQuery, { REQUEST_TEMPERATURE_QUERY } from '../actions/requestTemperatureQuery'

import getPollingInterval from '../../config/selectors/getPollingInterval'

const { PREEMPTIVE } = PriorityEnum

export const initialState = Record({
  isReady: false,
  pollingInterval: null,
})()

const pollTemperatureReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      return state.set('pollingInterval', getPollingInterval(config))
    }
    case PRINTER_READY: {
      const nextState = state.set('isReady', true)

      return loop(nextState, Cmd.action(requestTemperatureQuery()))
    }
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      return state.set('isReady', false)
    }
    case SERIAL_RECEIVE: {
      const data = action.payload

      // if it has temperature data
      if (
        data
        && data.type === 'ok'
        && data.temperatures != null
      ) {
        return loop(
          state,
          Cmd.run(Promise.delay, {
            args: [state.pollingInterval],
            successActionCreator: requestTemperatureQuery,
          }),
        )
      }
      return state
    }
    case REQUEST_TEMPERATURE_QUERY: {
      if (!state.isReady) return state

      const nextAction = spoolTask({
        name: 'spoolTemperatureQuery',
        internal: true,
        priority: PREEMPTIVE,
        data: ['M105'],
      })

      return loop(
        state,
        Cmd.action(nextAction),
      )
    }
    default: {
      return state
    }
  }
}

export default pollTemperatureReducer
