// @flow
import { createDriverErrorAction } from 'tegh-server'
import { utils as sagaUtils } from 'redux-saga'
const { SAGA_ACTION } = sagaUtils

import delayMockedSagaTester from '../../test_helpers/delayMockedSagaTester'
import serialSend from '../../actions/serialSend'
import serialReceiveSaga from './serialReceiveSaga'

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

const itDoesNothingWhen = ({ready, type, ignoreOK = false}) => {
  test(
    `when ready = ${ready} and shouldIgnoreOK = ${ignoreOK}` +
    ` it does nothing`,
    () => {
      const selectors = {
        isReady: () => ready,
        shouldIgnoreOK: () => ignoreOK,
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
  itDoesNothingWhen({ ready: true, ignoreOK: true, type: 'ok'})
  test(
    'when driver is ready it dispatching DESPOOL',
    () => {
      const selectors = {
        isReady: () => true,
        shouldIgnoreOK: () => false,
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

describe('SERIAL_RECEIVE error', () => {
  itDoesNothingWhen({ ready: false, type: 'error'})
  test(
    'when driver is ready it dispatching DRIVER_ERROR',
    () => {
      const selectors = {
        isReady: () => true,
        shouldIgnoreOK: () => false,
      }
      const raw = 'Error:PROBE FAIL CLEAN NOZZLE'
      const serialReceiveError = serialReceive('error', { raw })
      const firmwareError = {
        ...createDriverErrorAction({
          code: 'FIRMWARE_ERROR',
          message: raw,
        }),
        [SAGA_ACTION]: true,
      }

      const { sagaTester, delayMock } = delayMockedSagaTester({
        initialState: {},
        saga: serialReceiveSaga(selectors),
      })
      sagaTester.dispatch(serialReceiveError)

      const result = sagaTester.getCalledActions()

      expect(result).toEqual([
        serialReceiveError,
        firmwareError,
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
      let ignoreOK = false
      const selectors = {
        isReady: () => true,
        shouldIgnoreOK: () => ignoreOK,
        getCurrentLine: () => '(╯°□°）╯︵ ┻━┻',
        getCurrentSerialLineNumber: () => 42,
      }
      const { sagaTester, delayMock } = delayMockedSagaTester({
        initialState: {},
        saga: serialReceiveSaga(selectors),
      })
      const receiveResend = serialReceive('resend', { lineNumber: 41 })
      sagaTester.dispatch(receiveResend)
      ignoreOK = true
      sagaTester.dispatch(serialReceive('ok'))

      const result = sagaTester.getCalledActions()

      expect(result).toEqual([
        receiveResend,
        serialReceive('ok'),
        {
          ...serialSend('(╯°□°）╯︵ ┻━┻', { lineNumber: 41 }),
          [SAGA_ACTION]: true,
        },
      ])
    }
  )
})
