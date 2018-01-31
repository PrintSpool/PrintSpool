// @flow
import { utils as sagaUtils } from 'redux-saga'
const { SAGA_ACTION } = sagaUtils

import delayMockedSagaTester from '../test_helpers/delayMockedSagaTester'
import expectSimilarActions from '../test_helpers/expectSimilarActions'
import spoolTemperatureQuery from '../actions/spoolTemperatureQuery'
import pollTemperatureSaga from './pollTemperatureSaga'

const createTester = () => {
  const selectors = {
    getPollingInterval: () => 200,
  }
  const { sagaTester, delayMock } = delayMockedSagaTester({
    saga: pollTemperatureSaga(selectors)
  })
  return { sagaTester, delayMock }
}

const printerReadyAction = {
  type: 'PRINTER_READY',
}

const receiveOkWithTemp = {
  type: 'SERIAL_RECEIVE',
  data: {
    type: 'ok',
    temperatures: { e0: 10 }
  },
}

const receiveOkWithoutTemp = {
  type: 'SERIAL_RECEIVE',
  data: {
    type: 'ok',
  },
}

const spoolTempQueryFromSaga = {
  ...spoolTemperatureQuery(),
  [SAGA_ACTION]: true,
}

test('on receiving PRINTER_READY queries temperature immediately', async () => {
  const { sagaTester, delayMock } = createTester()
  sagaTester.dispatch(printerReadyAction)

  const result = sagaTester.getCalledActions()

  expectSimilarActions(result, [
    printerReadyAction,
    spoolTempQueryFromSaga,
  ])
})

test('on receiving temperature data waits to send next poll', async () => {
  const { sagaTester, delayMock } = createTester()
  sagaTester.dispatch(receiveOkWithTemp)

  expect(sagaTester.getCalledActions()).toEqual([
    receiveOkWithTemp,
  ])

  expect(delayMock.unacknowledgedDelay).not.toBe(null)
  const pause = await delayMock.waitForDelay()
  expect(pause.length).toEqual(200)
  pause.next()

  const result = sagaTester.getCalledActions()

  expectSimilarActions(result, [
    receiveOkWithTemp,
    spoolTempQueryFromSaga,
  ])
})

test('does not poll if it does not receive temperature data', async () => {
  const { sagaTester, delayMock } = createTester()
  sagaTester.dispatch(receiveOkWithoutTemp)

  expect(delayMock.unacknowledgedDelay).toBe(null)

  const result = sagaTester.getCalledActions()

  expectSimilarActions(result, [
    receiveOkWithoutTemp,
  ])
})
