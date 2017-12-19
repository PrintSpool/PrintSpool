// @flow
import util from 'util'
import SagaTester from 'redux-saga-tester'

import spoolTemperatureQuery from '../../src/actions/spool_temperature_query'
import pollTemperatureSaga from '../../src/sagas/poll_temperature_saga'

const setImmediatePromise = util.promisify(setImmediate)

const initialState = {
  config: {
    driver: {
      temperaturePollingInterval: 0, // 200, // TODO: delay mocks
    },
  },
}

const initTester = () => {
  // TODO: see https://github.com/redux-saga/redux-saga/issues/1295
  const delayMock = null
  const sagaTester = new SagaTester({ initialState })
  sagaTester.start(pollTemperatureSaga)
  return { sagaTester, delayMock }
}

test('on receiving temperature data waits to send next poll', async () => {
  const { sagaTester, delayMock } = initTester()
  sagaTester.dispatch({
    type: 'SERIAL_RECEIVE',
    data: { temperatures: { e0: 10 } },
  })

  // TODO: delay mocks
  // const delay = await delayMock.waitForDelay()
  // expect(delayMock.timeout).toEqual(200)
  // delayMock.next()

  await setImmediatePromise(() => {
    const result = sagaTester.getCalledActions().slice(1)

    expect(result).toEqual(spoolTemperatureQuery())
  })
})

test('does not poll if it does not receive temperature data', async () => {
  const { sagaTester, delayMock } = initTester()
  sagaTester.dispatch({
    type: 'SERIAL_RECEIVE',
    data: {},
  })

  await setImmediatePromise(() => {
    const result = sagaTester.getCalledActions().slice(1)

    expect(result.length).toBe(0)
  })
})
