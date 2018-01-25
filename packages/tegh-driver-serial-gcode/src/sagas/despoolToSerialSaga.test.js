// @flow
import { utils as sagaUtils } from 'redux-saga'
import SagaTester from 'redux-saga-tester'
import { List } from 'immutable'
import { createEStopAction } from 'tegh-daemon'
const { SAGA_ACTION } = sagaUtils

import despoolToSerialSaga from './despoolToSerialSaga'
import serialSend from '../actions/serialSend'

const despoolAction = { type: 'DESPOOL' }
const spoolAction = { type: 'SPOOL' }

const sentLine = {
  ...serialSend('(╯°□°）╯︵ ┻━┻', { lineNumber: 1995 }),
  [SAGA_ACTION]: true,
}

const sentEmergencyLine = {
  ...serialSend('(╯°□°）╯︵ ┻━┻', { lineNumber: false }),
  [SAGA_ACTION]: true,
}

const selectors = {
  shouldSendSpooledLineToPrinter: () => false,
  getCurrentLine: () => '(╯°□°）╯︵ ┻━┻',
  getCurrentSerialLineNumber: () => 1995,
  isEmergency: () => false,
  isReady: () => true,
}

const createTester = (selectorOverrides = {}) => {
  const sagaTester = new SagaTester({ initialState: {} })
  sagaTester.start(despoolToSerialSaga({
    ...selectors,
    ...selectorOverrides,
  }))
  return sagaTester
}

describe('DESPOOL', () => {
  test('sends next line', async () => {
    const sagaTester = createTester()
    sagaTester.dispatch(despoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      despoolAction,
      sentLine,
    ])
  })

  test('does nothing if the printer is not ready', async () => {
    const sagaTester = createTester({
      isReady: () => false,
    })
    sagaTester.dispatch(despoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      despoolAction,
    ])
  })
})

describe('SPOOL', () => {
  test('sends next line when shouldSendSpooledLineToPrinter is true', () => {
    const sagaTester = createTester({
      shouldSendSpooledLineToPrinter: () => true,
    })
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      spoolAction,
      sentLine,
    ])
  })

  test('does nothing if the printer is not ready', async () => {
    const sagaTester = createTester({
      isReady: () => false,
      shouldSendSpooledLineToPrinter: () => true,
    })
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      spoolAction,
    ])
  })

  test('if the printer is not ready it sends the line in emergencies', () => {
    const sagaTester = createTester({
      shouldSendSpooledLineToPrinter: () => true,
      isEmergency: () => true,
      isReady: () => false,
    })
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      spoolAction,
      sentEmergencyLine,
    ])
  })

  test('does not send line numbers in emergencies', () => {
    const sagaTester = createTester({
      shouldSendSpooledLineToPrinter: () => true,
      isEmergency: () => true,
    })
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      spoolAction,
      sentEmergencyLine,
    ])
  })

  test('does nothing when the printer is not idle', async () => {
    const sagaTester = createTester()
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      spoolAction
    ])
  })
})
