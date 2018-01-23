// @flow
import { utils as sagaUtils } from 'redux-saga'
import SagaTester from 'redux-saga-tester'
import sagaDelayMock from 'redux-saga-delay-mock'

import spoolTemperatureQuery from '../actions/spool_temperature_query'
import pollTemperatureSaga from './poll_temperature_saga'

const { SAGA_ACTION } = sagaUtils

const initialState = {
  config: {
    driver: {
      temperaturePollingInterval: 200,
    },
  },
}

const initTester = () => {
  // TODO: see https://github.com/redux-saga/redux-saga/issues/1295
  const delayMock = sagaDelayMock()
  const sagaTester = new SagaTester({
    initialState,
    options: {
      effectMiddlewares: [delayMock],
    },
  })
  sagaTester.start(pollTemperatureSaga)
  return { sagaTester, delayMock }
}

test('on receiving temperature data waits to send next poll', async () => {
  const { sagaTester, delayMock } = initTester()
  sagaTester.dispatch({
    type: 'SERIAL_RECEIVE',
    data: { temperatures: { e0: 10 } },
  })

  expect(delayMock.unacknowledgedDelay).not.toBe(null)
  const pause = await delayMock.waitForDelay()
  expect(pause.length).toEqual(200)
  pause.next()

  const result = sagaTester.getCalledActions().slice(1)

  expect(result).toEqual([{
    ...spoolTemperatureQuery(),
    [SAGA_ACTION]: true,
  }])
})

test('does not poll if it does not receive temperature data', async () => {
  const { sagaTester, delayMock } = initTester()
  sagaTester.dispatch({
    type: 'SERIAL_RECEIVE',
    data: {},
  })

  expect(delayMock.unacknowledgedDelay).toBe(null)

  const result = sagaTester.getCalledActions().slice(1)

  expect(result.length).toBe(0)
})
