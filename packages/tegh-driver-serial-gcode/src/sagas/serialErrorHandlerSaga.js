// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call, delay } = effects

const serialErrorHandlerSaga = () => {
  // Re-throw serial port errors as uncaught exceptions so that they crash
  // the process. Continuing after a serial error leads to an unknown state.
  const onSerialError = function*(action) {
    throw action.error
  }

  return function*() {
    yield takeLatest('SERIAL_ERROR', onSerialError)
  }
}

export default serialErrorHandlerSaga
