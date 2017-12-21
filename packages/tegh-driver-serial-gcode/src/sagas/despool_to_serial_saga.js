// @flow
import { effects } from 'tegh-daemon'

import serialSend from '../actions/serial_send'

const { put, takeEvery, takeLatest, select, call } = effects

const getCurrentLine = (state) =>
  state.spool.currentLine
const getCurrentLineNumber = (state) =>
  state.driver.currentLineNumber
const shouldSendSpooledLineToPrinter = (state) =>
  state.spool.sendSpooledLineToPrinter


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
    const currentLineNumber = yield select(getCurrentLineNumber)
    yield put(serialSend(currentLineNumber, currentLine))
  }
}

const despoolToSerialSaga = function*() {
  yield takeEvery(['DESPOOL', 'SPOOL'], onSpoolerChange)
}

export default despoolToSerialSaga
