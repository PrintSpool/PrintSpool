// @flow
import { utils as sagaUtils } from 'redux-saga'

import delayMockedSagaTester from '../__helpers/delay_mocked_saga_tester'

import spoolTemperatureQuery from '../../src/actions/spool_temperature_query'
import serialReceiveSaga from '../../src/sagas/serial_receive_saga'
import serialSend from '../../src/actions/serial_send'

const { SAGA_ACTION } = sagaUtils

const createState = ({ready, delayFromGreetingToReady = 200}) => ({
  driver: {
    ready,
  },
  config: {
    driver: {
      delayFromGreetingToReady,
    }
  }
})

const itDoesNothingWhen = ({ready, type}) => {
  test(
    `when ready = ${ready} it does nothing`,
    () => {
      const initialState = createState({ ready })
      const { sagaTester, delayMock } = delayMockedSagaTester({
        initialState,
        saga: serialReceiveSaga,
      })
      sagaTester.dispatch({
        type: 'SERIAL_RECEIVE',
        data: {
          type
        },
      })

      const pause = delayMock.unacknowledgedDelay
      expect(pause).toBe(null)
      const result = sagaTester.getCalledActions().slice(1)
      expect(result).toEqual([])
    }
  )
}

describe('SERIAL_RECEIVE greeting', () => {
  itDoesNothingWhen({ ready: true, type: 'greeting'})

  test(
    'when driver is not ready it dispatching PRINTER_READY after a delay',
    () => {
      const initialState = createState({
        ready: false,
        delayFromGreetingToReady: 50*1000,
      })
      const { sagaTester, delayMock } = delayMockedSagaTester({
        initialState,
        saga: serialReceiveSaga,
      })
      sagaTester.dispatch({
        type: 'SERIAL_RECEIVE',
        data: {
          type: 'greeting'
        },
      })

      const pause = delayMock.unacknowledgedDelay
      expect(pause.length).toEqual(50*1000)
      pause.next()

      const result = sagaTester.getCalledActions().slice(1)

      expect(result).toEqual([
        {
          type: 'PRINTER_READY',
          [SAGA_ACTION]: true,
        },
        {
          ...spoolTemperatureQuery(),
          [SAGA_ACTION]: true,
        },
      ])
    }
  )
})

describe('SERIAL_RECEIVE ok', () => {
  itDoesNothingWhen({ ready: false, type: 'ok'})
  test(
    'when driver is ready it dispatching DESPOOL',
    () => {
      const initialState = createState({
        ready: true,
      })

      const { sagaTester, delayMock } = delayMockedSagaTester({
        initialState,
        saga: serialReceiveSaga,
      })
      sagaTester.dispatch({
        type: 'SERIAL_RECEIVE',
        data: {
          type: 'ok'
        },
      })

      const result = sagaTester.getCalledActions().slice(1)

      expect(result).toEqual([
        {
          type: 'DESPOOL',
          [SAGA_ACTION]: true,
        },
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
      const initialState = {
        ...createState({ ready: true }),
        spool: {
          currentLine: '(╯°□°）╯︵ ┻━┻',
          currentLineNumber: 42,
        }
      }

      const { sagaTester, delayMock } = delayMockedSagaTester({
        initialState,
        saga: serialReceiveSaga,
      })
      sagaTester.dispatch({
        type: 'SERIAL_RECEIVE',
        data: {
          type: 'resend',
          lineNumber: 41,
        },
      })

      const result = sagaTester.getCalledActions().slice(1)

      expect(result).toEqual([
        {
          ...serialSend('(╯°□°）╯︵ ┻━┻', { lineNumber: 41 }),
          [SAGA_ACTION]: true,
        },
      ])
    }
  )
})
