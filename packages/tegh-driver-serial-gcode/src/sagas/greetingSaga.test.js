// @flow
import { utils as sagaUtils } from 'redux-saga'
const { SAGA_ACTION } = sagaUtils

import delayMockedSagaTester from '../test_helpers/delayMockedSagaTester'
import expectSimilarActions from '../test_helpers/expectSimilarActions'
import serialSend from '../actions/serialSend'
import greetingSaga from './greetingSaga'

const createTester = (selectors) => {
  const { sagaTester, delayMock } = delayMockedSagaTester({
    saga: greetingSaga(selectors)
  })
  return { sagaTester, delayMock }
}

const printerReadyAction = {
  type: 'PRINTER_READY',
  [SAGA_ACTION]: true,
}

const sendHello = {
  ...serialSend('M110 N0', { lineNumber: false }),
  [SAGA_ACTION]: true,
}

const serialReceive = (type) => ({
  type: 'SERIAL_RECEIVE',
  data: {
    type,
  },
})

describe('when the printer is ready', () => {
  test('it ignores all actions', async () => {
    const { sagaTester, delayMock } = createTester({
      isReady: () => true,
    })
    sagaTester.dispatch(serialReceive('greeting'))

    const result = sagaTester.getCalledActions()

    expectSimilarActions(result, [
      serialReceive('greeting'),
    ])
  })
})

describe('on receiving a greeting', () => {
  test('sends hello', async () => {
    const { sagaTester, delayMock } = createTester({
      isReady: () => false,
    })
    sagaTester.dispatch(serialReceive('greeting'))

    const result = sagaTester.getCalledActions()

    expectSimilarActions(result, [
      serialReceive('greeting'),
      sendHello,
    ])
  })
})

describe('on receiving a \'ok\' to the hello message', () => {
  test('puts PRINTER_READY', async () => {
    const { sagaTester, delayMock } = createTester({
      isReady: () => false,
    })
    sagaTester.dispatch(serialReceive('ok'))

    const result = sagaTester.getCalledActions()

    expectSimilarActions(result, [
      serialReceive('ok'),
      printerReadyAction,
    ])
  })
})
