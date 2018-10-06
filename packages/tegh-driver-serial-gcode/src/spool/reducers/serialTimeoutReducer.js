import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import getLongRunningCodes from '../../config/selectors/getLongRunningCodes'
import getSerialTimeout from '../../config/selectors/getSerialTimeout'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'
import serialTimeout from '../../serial/actions/serialTimeout'
import requestSerialPortTickle, { REQUEST_SERIAL_PORT_TICKLE } from '../actions/requestSerialPortTickle'

export const initialState = Record({
  awaitingLineNumber: null,
  ticklesAttempted: 0,
  timeoutPeriod: null,
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
    case SERIAL_SEND: {
      const { lineNumber, code } = action.payload

      if (typeof lineNumber !== 'number') return state

      const {
        longRunningCodeTimeout,
        fastCodeTimeout,
      } = getSerialTimeout(action.config)

      const isLong = getLongRunningCodes(action.config).includes(code)
      const timeoutPeriod = isLong ? longRunningCodeTimeout : fastCodeTimeout

      const nextState = initialState
        .set('awaitingLineNumber', lineNumber)
        .set('timeoutPeriod', timeoutPeriod)

      return loop(
        nextState,
        waitToTickleCmd(nextState),
      )
    }
    case SERIAL_RECEIVE: {
      if (['ok', 'feedback', 'greeting'].includes(action.payload.type)) {
        return initialState.set('awaitingLineNumber', null)
      }
      return state
    }
    case REQUEST_SERIAL_PORT_TICKLE: {
      if (action.payload.awaitingLineNumber !== state.awaitingLineNumber) {
        return state
      }

      const { tickleAttempts } = getSerialTimeout(action.config)

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
