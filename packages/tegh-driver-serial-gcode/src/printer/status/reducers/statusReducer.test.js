import { utils as sagaUtils } from 'redux-saga'
const { SAGA_ACTION } = sagaUtils

import {
  PRINTER_READY,
} from 'tegh-server'

import delayMockedSagaTester from '../../test_helpers/delayMockedSagaTester'
import serialSend from '../../serial/actions/serialSend'
import greetingSaga from './greetingSaga'

const createTester = (selectors) => {
  const { sagaTester, delayMock } = delayMockedSagaTester({
    saga: greetingSaga(selectors)
  })
  return { sagaTester, delayMock }
}

const printerReadyAction = {
  type: PRINTER_READY,
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

    expect(result).toMatchObject([
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

    expect(sagaTester.getCalledActions()).toMatchObject([
      serialReceive('greeting'),
    ])

    expect(delayMock.unacknowledgedDelay).not.toBe(null)
    const pause = await delayMock.waitForDelay()
    expect(pause.length).toEqual(50)
    pause.next()

    const result = sagaTester.getCalledActions()

    expect(result).toMatchObject([
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

    expect(result).toMatchObject([
      serialReceive('ok'),
      printerReadyAction,
    ])
  })
})
