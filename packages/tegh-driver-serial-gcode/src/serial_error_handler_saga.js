// Re-throw serial port errors as uncaught exceptions so that they crash
// the process. Continuing after a serial error leads to an unknown state.
const onSerialError = function*( {(action) => {
  throw action.error
})

export default const serialErrorHandlerSaga = function*() {
  yield all([
    takeLatest('SERIAL_ERROR', onSerialError),
  ]
}
