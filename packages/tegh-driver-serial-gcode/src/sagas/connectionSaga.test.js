import { effects, utils as sagaUtils } from 'redux-saga'
const { call, put, take, takeEvery, takeLatest, select } = effects
const { SAGA_ACTION } = sagaUtils
import SagaTester from 'redux-saga-tester'
import { List } from 'immutable'
import { createEStopAction } from 'tegh-server'

import { forkEvery } from './helpers/'
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

const testPut = { type: 'TEST_PUT', [SAGA_ACTION]: true }
const testTake = { type: 'TEST_TAKE' }

const testSaga = () => function*() {
  yield forkEvery(testTake.type, function*() {
    yield put(testPut)
  })
}

const createTester = () => {
  const sagaTester = new SagaTester({ initialState: {} })
  sagaTester.start(connectionSaga({}, { connectedSagasByName: { testSaga } }))
  return sagaTester
}

test('on SERIAL_OPEN it starts the connected sagas', () => {
  const sagaTester = createTester()
  sagaTester.dispatch(open)
  sagaTester.dispatch(testTake)

  const result = sagaTester.getCalledActions()

  expect(result).toEqual([
    open,
    testTake,
    testPut,
  ])
})

const shutdownActionTypes = ['ESTOP', 'DRIVER_ERROR', 'SERIAL_CLOSE']

shutdownActionTypes.forEach(type => {
  test(`on ${type} it stops the sagas`, () => {
    const shutdownAction = { type }
    const sagaTester = createTester()
    sagaTester.dispatch(open)
    sagaTester.dispatch(testTake)
    sagaTester.dispatch(shutdownAction)
    /*
     * firing the action the connected saga is listening for does nothing
     * because the shutdown action cancelled the saga
     */
    sagaTester.dispatch(testTake)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      open,
      testTake,
      testPut,
      shutdownAction,
      testTake,
    ])
  })
})
