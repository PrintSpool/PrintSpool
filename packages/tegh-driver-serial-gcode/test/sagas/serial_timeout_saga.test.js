// @flow
import { utils as sagaUtils } from 'redux-saga'

import delayMockedSagaTester from '../__helpers/delay_mocked_saga_tester'

import serialTimeoutSaga from '../../src/sagas/serial_timeout_saga'
import serialSend from '../../src/actions/serial_send'

const { SAGA_ACTION } = sagaUtils

const fastCodeTimeout = 3000
const longRunningCodeTimeout = 10000
const initialState = {
  config: {
    driver: {
      serialTimeout: {
        tickleAttempts: 3,
        fastCodeTimeout,
        longRunningCodeTimeout,
      },
      longRunningCodes: ['G28'],
    },
  },
}

const tickleMCodeAction = {
  ...serialSend('M105', { lineNumber: false }),
  [SAGA_ACTION]: true,
}

const okReceivedAction = {
  type: 'SERIAL_RECEIVE',
  data: {
    type: 'ok',
  },
}

const serialTimeoutAction = {
  type: 'SERIAL_TIMEOUT',
  [SAGA_ACTION]: true,
}

const startingConditions = ({ long }) => {
  const { sagaTester, delayMock } = delayMockedSagaTester({
    initialState,
    saga: serialTimeoutSaga,
  })
  const code = long ? 'G28' : 'G1'
  const sentGCodeAction = serialSend(code, { lineNumber: 42 })
  sagaTester.dispatch(sentGCodeAction)

  return { sagaTester, delayMock, sentGCodeAction }
}

describe('SERIAL_SEND', () => {
  [true, false].forEach(long => {
    describe(
      `when no response is received for ${long ? 'long running' : 'fast'} ` +
      `codes it sends M105`,
      () => {
        const expectTickle = ({ sagaTester, delayMock, tickleCount}) => {
          const pause = delayMock.unacknowledgedDelay
          expect(pause.length).toEqual(
            long ? longRunningCodeTimeout : fastCodeTimeout
          )
          pause.next()

          const result = sagaTester.getCalledActions()[1+tickleCount]

          expect(result).toEqual(tickleMCodeAction)
        }

        test(
          `if the firmware sends back 'ok' it stops tickling`,
          () => {
            const {
              sagaTester,
              delayMock,
              sentGCodeAction,
            } = startingConditions({ long })
            expectTickle({ sagaTester, delayMock, tickleCount: 0 })
            expectTickle({ sagaTester, delayMock, tickleCount: 1 })
            sagaTester.dispatch(okReceivedAction)
            /*
             * Even if the pause expires after the ok is received the saga
             * should not put another tickle.
             */
            const pause = delayMock.unacknowledgedDelay
            pause.next()

            const result = sagaTester.getCalledActions()

            expect(result).toEqual([
              sentGCodeAction,
              tickleMCodeAction,
              tickleMCodeAction,
              okReceivedAction,
            ])
          }
        )

        test(
          `if the firmware does not respond to multiple tickles it puts `+
          `SERIAL_TIMEOUT`,
          () => {
            const {
              sagaTester,
              delayMock,
              sentGCodeAction,
            } = startingConditions({ long })
            expectTickle({ sagaTester, delayMock, tickleCount: 0 })
            expectTickle({ sagaTester, delayMock, tickleCount: 1 })
            expectTickle({ sagaTester, delayMock, tickleCount: 2 })

            const result = sagaTester.getCalledActions()

            expect(result).toEqual([
              sentGCodeAction,
              tickleMCodeAction,
              tickleMCodeAction,
              tickleMCodeAction,
              serialTimeoutAction,
            ])
          }
        )
      }
    )
  })
  test(
    'when a response is received before the timeout it does nothing',
    () => {
      const {
        sagaTester,
        delayMock,
        sentGCodeAction,
      } = startingConditions({ long: false })
      sagaTester.dispatch(okReceivedAction)

      const result = sagaTester.getCalledActions()

      expect(result).toEqual([
        sentGCodeAction,
        okReceivedAction,
      ])
    }
  )
})
