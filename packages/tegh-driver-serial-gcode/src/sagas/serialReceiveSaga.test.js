// @flow
import { utils as sagaUtils } from 'redux-saga'
const { SAGA_ACTION } = sagaUtils

import delayMockedSagaTester from '../test_helpers/delayMockedSagaTester'
import serialReceiveSaga from './serialReceiveSaga'
import serialSend from '../actions/serialSend'

const serialReceive = (type, data) => ({
  type: 'SERIAL_RECEIVE',
  data: {
    type,
    ...data,
  },
})

const despoolAction = {
  type: 'DESPOOL',
  [SAGA_ACTION]: true,
}

const itDoesNothingWhen = ({ready, type}) => {
  test(
    `when ready = ${ready} it does nothing`,
    () => {
      const selectors = {
        isReady: () => ready,
      }
      const { sagaTester, delayMock } = delayMockedSagaTester({
        initialState: {},
        saga: serialReceiveSaga(selectors),
      })
      sagaTester.dispatch(serialReceive(type))

      const pause = delayMock.unacknowledgedDelay
      expect(pause).toBe(null)
      const result = sagaTester.getCalledActions().slice(1)
      expect(result).toEqual([])
    }
  )
}

describe('SERIAL_RECEIVE ok', () => {
  itDoesNothingWhen({ ready: false, type: 'ok'})
  test(
    'when driver is ready it dispatching DESPOOL',
    () => {
      const selectors = {
        isReady: () => true,
      }

      const { sagaTester, delayMock } = delayMockedSagaTester({
        initialState: {},
        saga: serialReceiveSaga(selectors),
      })
      sagaTester.dispatch(serialReceive('ok'))

      const result = sagaTester.getCalledActions()

      expect(result).toEqual([
        serialReceive('ok'),
        despoolAction,
      ])
    }
  )
})

describe('SERIAL_RECEIVE resend', () => {
  itDoesNothingWhen({ ready: false, type: 'resend'})
  // test(
  //   'when the resend is not for the previous line number it errors',
  //   () => {
  //     const initialState = {
  //       ...createState({ ready: true }),
  //       spool: {
  //         currentLine: '(╯°□°）╯︵ ┻━┻',
  //         currentLineNumber: 42,
  //       }
  //     }
  //
  //     const { sagaTester, delayMock } = delayMockedSagaTester({
  //       initialState,
  //       saga: serialReceiveSaga,
  //     })
  //     sagaTester.dispatch({
  //       type: 'SERIAL_RECEIVE',
  //       data: {
  //         type: 'resend',
  //         lineNumber: 26,
  //       },
  //     })
  //     // TODO: expect error
  //   }
  // )
  test(
    'when the resend is for the previous line number it resends it',
    () => {
      const selectors = {
        isReady: () => true,
        getCurrentLine: () => '(╯°□°）╯︵ ┻━┻',
        getCurrentSerialLineNumber: () => 42,
      }
      const { sagaTester, delayMock } = delayMockedSagaTester({
        initialState: {},
        saga: serialReceiveSaga(selectors),
      })
      const receiveResend = serialReceive('resend', { lineNumber: 41 })
      sagaTester.dispatch(receiveResend)

      const result = sagaTester.getCalledActions()

      expect(result).toEqual([
        receiveResend,
        {
          ...serialSend('(╯°□°）╯︵ ┻━┻', { lineNumber: 41 }),
          [SAGA_ACTION]: true,
        },
      ])
    }
  )
})
