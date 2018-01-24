// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call } = effects

import serialSend from '../actions/serialSend'

const despoolToSerialSaga = ({
  shouldSendSpooledLineToPrinter,
  getCurrentLine,
  getCurrentSerialLineNumber,
}) => {
  /*
   * Intercepts DESPOOL and SPOOL actions and sends the current gcode line to the
   * printer. Executes after the reducers have resolved which line to send.
   *
   * The first SPOOL action to an idle printer triggers this to begin printing
   * the spooled line.
   */
  const onSpoolerChange = function*(action: {type: string}) {
    const { type } = action
    const shouldSendSpool = yield select(shouldSendSpooledLineToPrinter)
    const currentLine = yield select(getCurrentLine)
    if (
      type === 'DESPOOL' && currentLine != null ||
      type === 'SPOOL' && shouldSendSpool
    ) {
      const lineNumber = yield select(getCurrentSerialLineNumber)
      yield put(serialSend(currentLine, { lineNumber }))
    }
  }

  return function*() {
    yield takeEvery(['DESPOOL', 'SPOOL'], onSpoolerChange)
  }
}

export default despoolToSerialSaga
