// @flow
import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import serialSend from '../../actions/serialSend'
import createSerialTimeoutAction from '../../actions/createSerialTimeoutAction'

export const initialState = Record({
  awaitingLineNumber: null,
  ticklesAttempted: 0,
})()

export const waitToTickle = async ({ awaitingLineNumber }, timeoutPeriod) => {
  await Promise.delay(timeoutPeriod)
  return { awaitingLineNumber }
}

const waitToTickleCmd = (state, action) => {
  const {
    longRunningCodeTimeout,
    fastCodeTimeout,
  } = getSerialTimeout(action.config)

  const isLong = getLongRunningCodes(action.config).includes(action.code)
  const timeoutPeriod = isLong ?  longRunningCodeTimeout : fastCodeTimeout

  return Cmd.run(waitToTickle, {
    args: [state, timeoutPeriod],
    successActionCreator: requestSerialPortTickle,
  })
}

const serialTimeoutSaga = (state, action) => {
  switch (action.type) {
    case SERIAL_SEND: {
      const { lineNumber } = action

      if (typeof lineNumber !== 'number') return state

      const nextState = initialState.set('awaitingLineNumber', lineNumber)

      return loop(nextState, waitToTickleCmd(nextState, action))
    }
    case SERIAL_RECEIVE: {
      if (['ok', 'feedback', 'greeting'].includes(data.type)) {
        return initialState.set('awaitingLineNumber', null)
      }
      return state
    }
    case REQUEST_SERIAL_PORT_TICKLE: {
      const { tickleAttempts } = getSerialTimeout(action.config)

      if (state.ticklesAttempted < tickleAttempts) {
        const nextState = state.update('ticklesAttempted', i => i + 1)

        return loop(nextState, Cmd.list([
          // send a tickle M105 to try to get an 'ok' from the serial port
          Cmd.action({
            ...serialSend('M105', { lineNumber: false }),
            tickle: true,
          }),
          waitToTickleCmd(nextState, action),
        ]))
      }

      return loop(state, Cmd.action(createSerialTimeoutAction()))
    }
    default: {
      return state
    }
  }
}

export default serialTimeoutSaga
