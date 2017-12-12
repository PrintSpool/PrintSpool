import { put, takeEvery, takeLatest, select, all } from 'redux-saga/effects'

const getCurrentLine = (state) => state.spool.currentLine
const getCurrentLineNumber = (state) => state.spool.currentLineNumber

const shouldDespool = ({ type }, currentLine) {
  return (
    type === 'DESPOOL' ||
    type === 'SPOOL' && currentLine == null
  )
}

/*
 * Intercepts DESPOOL and SPOOL actions and sends the current gcode line to the
 * printer. Executes after the reducers have resolved which line to send.
 *
 * The first SPOOL action to an idle printer triggers this to begin printing
 * the spooled line.
 */
 const txSaga = function*(action) {
  const currentLine = yield select(getCurrentLine)
  if (!shouldDespool(action, currentLine)) return

   // TODO: increment line numbers (maybe in the reducer)
  // TODO: checksums
  // TODO: also do these transforms for resends
  const currentLineNumber = yield select(getCurrentLineNumber)
  yield puts({
    type: 'SERIAL_SEND',
    data: `N${currentLineNumber} ${currentLine}`,
  })
}

export default const txSaga = function*() {
  takeEvery(['DESPOOL', 'SPOOL'], despool)
}
