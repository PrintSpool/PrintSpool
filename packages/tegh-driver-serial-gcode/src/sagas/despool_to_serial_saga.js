// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call } = effects

import serialSend from '../actions/serial_send'
import {
  shouldSendSpooledLineToPrinter,
  getCurrentLine,
  getCurrentSerialLineNumber,
} from '../selectors'


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
  const currentTask = yield select(getCurrentTask)
  if (
    type === 'DESPOOL' && currentTask != null ||
    type === 'SPOOL' && shouldSendSpool
  ) {
    const currentSerialLineNumber = yield select(getCurrentSerialLineNumber)
    const currentLine = currentTask.data.get(currentTask.currentLineNumber)
    yield put(serialSend(currentLine, { lineNumber: currentSerialLineNumber}))
  }
}

const despoolToSerialSaga = function*() {
  yield takeEvery(['DESPOOL', 'SPOOL'], onSpoolerChange)
}

export default despoolToSerialSaga
