// @flow

// Re-throw serial port errors as uncaught exceptions so that they crash
// the process. Continuing after a serial error leads to an unknown state.
export const onSerialError = function*(action) {
  throw action.error
}

const serialErrorHandlerSaga = function*() {
  yield takeLatest('SERIAL_ERROR', onSerialError)
}

export default serialErrorHandlerSaga
