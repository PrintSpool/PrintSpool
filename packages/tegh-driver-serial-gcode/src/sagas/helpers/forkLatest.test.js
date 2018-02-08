import { effects, utils as sagaUtils } from 'redux-saga'
const { call, put, take, takeEvery, takeLatest, select, fork, cancel, spawn, all, race } = effects
const { SAGA_ACTION } = sagaUtils

import SagaTester from 'redux-saga-tester'

import forkLatest from './forkLatest'

const testPut = { type: 'TEST_PUT', [SAGA_ACTION]: true }
const testPut2 = { type: 'TEST_222_PUT_2', [SAGA_ACTION]: true }
const testTake = { type: 'TEST_TAKE' }
const testTake2 = { type: 'TEST_222_TAKE_2' }
const testCancel = { type: 'TEST_CANCEL' }

const testSaga = function*() {
  const result = yield race({
    worker: forkLatest(testTake.type, function*() {
      yield put(testPut)
      yield take(testTake2.type)
      yield put(testPut2)
    }),
    canceller: take(testCancel.type),
  })
}

const createTester = () => {
  const sagaTester = new SagaTester({ initialState: {} })
  sagaTester.start(testSaga)
  return sagaTester
}

test('is cancellable', () => {
  const actionsBeforeCancel = [
    testTake,
    testPut,
    testTake,
    testPut,
    testTake2,
    testPut2,
  ]
  const sagaTester = createTester()
  sagaTester.dispatch(testTake)
  sagaTester.dispatch(testTake)
  sagaTester.dispatch(testTake2)
  expect(sagaTester.getCalledActions()).toEqual(actionsBeforeCancel)
  sagaTester.dispatch(testCancel)
  sagaTester.dispatch(testTake)
  sagaTester.dispatch(testTake)
  sagaTester.dispatch(testTake2)
  expect(sagaTester.getCalledActions()).toEqual([
    ...actionsBeforeCancel,
    testCancel,
    testTake,
    testTake,
    testTake2,
  ])

})
