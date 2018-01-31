import { effects } from 'redux-saga'
const { put, take, takeEvery, takeLatest, select, call } = effects
import { utils as sagaUtils } from 'redux-saga'
import SagaTester from 'redux-saga-tester'
import { List } from 'immutable'
import { createEStopAction } from 'tegh-server'
const { SAGA_ACTION } = sagaUtils

import connectionSaga from './connectionSaga'
import serialSend from '../actions/serialSend'

const open = {
  type: 'SERIAL_OPEN'
}
const estop = {
  ...createEStopAction(),
}
const driverError = {
  type: 'DRIVER_ERROR',
}
const serialClose = {
  type: 'SERIAL_CLOSE',
}

const testPut = i => ({ type: `TEST_PUT_${i}`, [SAGA_ACTION]: true })
const testTake = i => ({ type: `TEST_TAKE_${i}` })

const testSaga = () => function*() {
  yield put(testPut(1))
  yield take(testTake(1).type)
  yield put(testPut(2))
  yield take(testTake(2).type)
}

const createTester = () => {
  const sagaTester = new SagaTester({ initialState: {} })
  sagaTester.start(connectionSaga({}, { connectedSagasByName: { testSaga } }))
  return sagaTester
}

test('on SERIAL_OPEN it starts the connected sagas', () => {
  const sagaTester = createTester()
  sagaTester.dispatch(open)
  sagaTester.dispatch(testTake(1))

  const result = sagaTester.getCalledActions()

  expect(result).toEqual([
    open,
    testPut(1),
    testTake(1),
    testPut(2),
  ])
})

const shutdownActionTypes = ['ESTOP', 'DRIVER_ERROR', 'SERIAL_CLOSE']

shutdownActionTypes.forEach(type => {
  test(`on ${type} it stops the sagas`, () => {
    const shutdownAction = { type }
    const sagaTester = createTester()
    sagaTester.dispatch(open)
    sagaTester.dispatch(shutdownAction)
    /*
     * firing the action the connected saga is listening for does nothing
     * because the shutdown action cancelled the saga
     */
    sagaTester.dispatch(testTake(1))

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      open,
      testPut(1),
      shutdownAction,
      testTake(1),
    ])
  })
})
