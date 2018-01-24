// @flow
import { utils as sagaUtils } from 'redux-saga'
import SagaTester from 'redux-saga-tester'
import { List } from 'immutable'

import despoolToSerialSaga from './despoolToSerialSaga'
import serialSend from '../actions/serialSend'

const { SAGA_ACTION } = sagaUtils

const despoolAction = { type: 'DESPOOL' }
const spoolAction = { type: 'SPOOL' }

const sentLine = {
  ...serialSend('(╯°□°）╯︵ ┻━┻', { lineNumber: 1995 }),
  [SAGA_ACTION]: true,
}

const selectors = {
  shouldSendSpooledLineToPrinter: () => false,
  getCurrentLine: () => '(╯°□°）╯︵ ┻━┻',
  getCurrentSerialLineNumber: () => 1995,
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
})

describe('SPOOL', () => {
  test('sends next line when the printer is idle', () => {
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

  test('does nothing when the printer is not idle', async () => {
    const sagaTester = createTester()
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      spoolAction
    ])
  })
})
