import { utils as sagaUtils } from 'redux-saga'
import SagaTester from 'redux-saga-tester'
import { List } from 'immutable'
import { createEStopAction } from 'tegh-server'
const { SAGA_ACTION } = sagaUtils

import eStopSaga from './eStopSaga'
import serialSend from '../actions/serialSend'

const createTester = () => {
  const sagaTester = new SagaTester({ initialState: {} })
  sagaTester.start(eStopSaga())
  return sagaTester
}

const serialSendG1 = serialSend('G1 X10', { lineNumber: false })
const serialSendM112 = serialSend('M112', { lineNumber: false })
const serialSendM999 = serialSend('M999', { lineNumber: false })

const estop = {
  ...createEStopAction(),
  [SAGA_ACTION]: true,
}
const serialReset = {
  type: 'SERIAL_RESET',
  [SAGA_ACTION]: true,
}

test('puts ESTOP if an M112 is sent', () => {
  const sagaTester = createTester()
  sagaTester.dispatch(serialSendM112)

  const result = sagaTester.getCalledActions()

  expect(result).toEqual([
    serialSendM112,
    estop,
  ])
})

test('resets serial if an M999 is sent', () => {
  pending()
  // const sagaTester = createTester()
  // sagaTester.dispatch(serialSendM999)
  //
  // const result = sagaTester.getCalledActions()
  //
  // expect(result).toEqual([
  //   serialSendM999,
  //   serialReset,
  // ])
})

test('does nothing on other GCodes', () => {
  const sagaTester = createTester()
  sagaTester.dispatch(serialSendG1)

  const result = sagaTester.getCalledActions()

  expect(result).toEqual([
    serialSendG1,
  ])
})
