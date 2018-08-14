// @flow
import { effects, utils as sagaUtils } from 'redux-saga'
const { put, take, takeEvery, takeLatest, select, call, cancel, race } = effects

import delayMockedSagaTester from '../../test_helpers/delayMockedSagaTester'

import serialTimeoutSaga from './serialTimeoutSaga'
import serialSend from '../../serial/actions/serialSend'
import createSerialTimeoutAction from '../../actions/createSerialTimeoutAction'

const { SAGA_ACTION } = sagaUtils

const fastCodeTimeout = 3000
const longRunningCodeTimeout = 10000

const tickleMCodeAction = {
  ...serialSend('M105', { lineNumber: false }),
  tickle: true,
  [SAGA_ACTION]: true,
}

const okReceivedAction = {
  type: 'SERIAL_RECEIVE',
  data: {
    type: 'ok',
  },
}

const feedbackReceivedAction = {
  type: 'SERIAL_RECEIVE',
  data: {
    type: 'feedback',
  },
}


const serialTimeoutAction = createSerialTimeoutAction()

const cancelAction = {
  type: 'TEST_CANCEL',
}

const startingConditions = ({ long }) => {
  const selectors = {
    getLongRunningCodes: () => ['G28'],
    getSerialTimeout: () => ({
      tickleAttempts: 3,
      fastCodeTimeout,
      longRunningCodeTimeout,
    })
  }
  const { sagaTester, delayMock } = delayMockedSagaTester({
    saga: function*() {
      yield race({
        saga: call(serialTimeoutSaga(selectors)),
        cancelTake: take(cancelAction.type),
      })
    },
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
        const causeTimeout = ({ delayMock }) => {
          const pause = delayMock.unacknowledgedDelay
          expect(pause.length).toEqual(
            long ? longRunningCodeTimeout : fastCodeTimeout
          )
          pause.next(true)
        }
        const expectTickle = ({ sagaTester, delayMock, tickleCount}) => {
          causeTimeout({ delayMock })

          const result = sagaTester.getCalledActions()[1+tickleCount]

          expect(result).toMatchObject(tickleMCodeAction)
        }

        const expectToStopsTicklingAfter = ({action}) => {
          const {
            sagaTester,
            delayMock,
            sentGCodeAction,
          } = startingConditions({ long })
          expectTickle({ sagaTester, delayMock, tickleCount: 0 })
          expectTickle({ sagaTester, delayMock, tickleCount: 1 })
          sagaTester.dispatch(action)
          /*
           * Even if the pause expires after the ok is received the saga
           * should not put another tickle.
           */
          const pause = delayMock.unacknowledgedDelay
          pause.next(true)

          const result = sagaTester.getCalledActions()

          expect(result).toMatchObject([
            sentGCodeAction,
            tickleMCodeAction,
            tickleMCodeAction,
            action,
          ])
        }

        test(
          `if the firmware sends back 'ok' it stops tickling`,
          () => {
            expectToStopsTicklingAfter({
              action: okReceivedAction,
            })
          }
        )

        test(
          `if the firmware sends temperature feedback it stops tickling`,
          () => {
            expectToStopsTicklingAfter({
              action: feedbackReceivedAction,
            })
          }
        )

        test(
          `if the firmware does not respond to multiple tickles it puts `+
          `DRIVER_ERROR`,
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

            expect(result).toMatchObject([
              sentGCodeAction,
              tickleMCodeAction,
              tickleMCodeAction,
              tickleMCodeAction,
              serialTimeoutAction,
            ])
          }
        )

        test(
          `if the saga is cancelled it stops tickling`,
          () => {
            const {
              sagaTester,
              delayMock,
              sentGCodeAction,
            } = startingConditions({ long })
            sagaTester.dispatch(cancelAction)
            causeTimeout({ delayMock })

            const result = sagaTester.getCalledActions()

            expect(result).toMatchObject([
              sentGCodeAction,
              cancelAction,
            ])
          }
        )
      }
    )
  })
  test(
    'when a \'ok\' response is received before the timeout it does nothing',
    () => {
      const {
        sagaTester,
        delayMock,
        sentGCodeAction,
      } = startingConditions({ long: false })
      sagaTester.dispatch(okReceivedAction)
      sagaTester.dispatch(sentGCodeAction)
      sagaTester.dispatch(okReceivedAction)

      const result = sagaTester.getCalledActions()

      expect(result).toMatchObject([
        sentGCodeAction,
        okReceivedAction,
        sentGCodeAction,
        okReceivedAction,
      ])
    }
  )
  test(
    'when a feedback response is received before the timeout it does nothing',
    () => {
      const {
        sagaTester,
        delayMock,
        sentGCodeAction,
      } = startingConditions({ long: false })
      sagaTester.dispatch(feedbackReceivedAction)

      /*
       * Even if the pause expires after the feedback is received the saga
       * should not put another tickle.
       */
      const pause = delayMock.unacknowledgedDelay
      pause.next(true)

      const result = sagaTester.getCalledActions()

      expect(result).toMatchObject([
        sentGCodeAction,
        feedbackReceivedAction,
      ])
    }
  )

})
