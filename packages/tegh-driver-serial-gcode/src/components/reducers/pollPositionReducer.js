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
} from '@tegh/core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import requestPositionQuery, { REQUEST_POSITION_QUERY } from '../actions/requestPositionQuery'

import getPositionPollingInterval from '../../config/selectors/getPositionPollingInterval'

const { PREEMPTIVE } = PriorityEnum

export const initialState = Record({
  isReady: false,
  pollingInterval: null,
  awaitingData: false,
  awaitingOK: false,
})()

const pollPositionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      return state.set('pollingInterval', getPositionPollingInterval(config))
    }
    case PRINTER_READY: {
      const nextState = state.set('isReady', true)

      return loop(nextState, Cmd.action(requestPositionQuery()))
    }
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      return state.set('isReady', false)
    }
    case SERIAL_RECEIVE: {
      const data = action.payload

      // if it has position data
      if (
        data
        && data.position != null
      ) {
        return state.set('awaitingData', false)
      }

      if (
        data
        && data.type === 'ok'
        && state.awaitingData === false
        && state.awaitingOK === true
      ) {
        const nextState = state.set('awaitingOK', false)
        return loop(
          nextState,
          Cmd.run(Promise.delay, {
            args: [state.pollingInterval],
            successActionCreator: requestPositionQuery,
          }),
        )
      }
      return state
    }
    case REQUEST_POSITION_QUERY: {
      if (!state.isReady) return state

      const nextAction = spoolTask({
        name: 'spoolPositionQuery',
        internal: true,
        priority: PREEMPTIVE,
        data: ['M114'],
      })

      const nextState = state
        .set('awaitingData', true)
        .set('awaitingOK', true)

      return loop(
        nextState,
        Cmd.action(nextAction),
      )
    }
    default: {
      return state
    }
  }
}

export default pollPositionReducer
