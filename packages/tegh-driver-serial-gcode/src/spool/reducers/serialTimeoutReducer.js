import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import { SET_CONFIG } from 'tegh-core'

import getLongRunningCodes from '../../config/selectors/getLongRunningCodes'
import getSerialTimeout from '../../config/selectors/getSerialTimeout'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'
import { SERIAL_CLOSE } from '../../serial/actions/serialClose'
import serialTimeout from '../../serial/actions/serialTimeout'
import requestSerialPortTickle, { REQUEST_SERIAL_PORT_TICKLE } from '../actions/requestSerialPortTickle'

export const initialState = Record({
  awaitingLineNumber: null,
  ticklesAttempted: 0,
  timeoutPeriod: null,
  config: Record({
    tickleAttempts: null,
    longRunningCodeTimeout: null,
    fastCodeTimeout: null,
    longRunningCodes: null,
  })(),
})()

const waitToTickleCmd = ({ awaitingLineNumber, timeoutPeriod }) => {
  const successAction = requestSerialPortTickle({ awaitingLineNumber })

  return Cmd.run(Promise.delay, {
    args: [timeoutPeriod],
    successActionCreator: () => successAction,
  })
}

const serialTimeoutReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      const longRunningCodes = getLongRunningCodes(config)

      return state.mergeIn(['config'], {
        ...getSerialTimeout(config).toJS(),
        longRunningCodes,
      })
    }
    case SERIAL_SEND: {
      const { lineNumber, code } = action.payload

      if (typeof lineNumber !== 'number') return state

      const {
        longRunningCodeTimeout,
        fastCodeTimeout,
        longRunningCodes,
      } = state.config

      const isLong = longRunningCodes.includes(code)
      const timeoutPeriod = isLong ? longRunningCodeTimeout : fastCodeTimeout

      const nextState = state
        .set('ticklesAttempted', 0)
        .set('awaitingLineNumber', lineNumber)
        .set('timeoutPeriod', timeoutPeriod)

      return loop(
        nextState,
        waitToTickleCmd(nextState),
      )
    }
    case SERIAL_RECEIVE: {
      if (['ok', 'feedback', 'greeting'].includes(action.payload.type)) {
        return state
          .set('ticklesAttempted', 0)
          .set('awaitingLineNumber', null)
          .set('timeoutPeriod', null)
      }
      return state
    }
    case SERIAL_CLOSE: {
      return state
        .set('ticklesAttempted', 0)
        .set('awaitingLineNumber', null)
        .set('timeoutPeriod', null)
    }
    case REQUEST_SERIAL_PORT_TICKLE: {
      if (action.payload.awaitingLineNumber !== state.awaitingLineNumber) {
        return state
      }

      const { tickleAttempts } = state.config

      if (state.ticklesAttempted < tickleAttempts) {
        const nextState = state.update('ticklesAttempted', i => i + 1)

        return loop(
          nextState,
          Cmd.list([
            // send a tickle M105 to try to get an 'ok' from the serial port
            Cmd.action(
              serialSend('M105', { lineNumber: false }),
            ),
            waitToTickleCmd(nextState),
          ]),
        )
      }

      return loop(state, Cmd.action(serialTimeout()))
    }
    default: {
      return state
    }
  }
}

export default serialTimeoutReducer
