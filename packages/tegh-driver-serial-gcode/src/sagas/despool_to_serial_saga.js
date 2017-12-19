// @flow
import { put, takeEvery, takeLatest, select, call } from 'redux-saga/effects'

import serialSend from '../actions/serial_send'

const getCurrentLine = (state) =>
  state.spool.currentLine
const getCurrentLineNumber = (state) =>
  state.spool.currentLineNumber
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
  if (
    type === 'DESPOOL' ||
    type === 'SPOOL' && shouldSendSpool
  ) {
    const currentLine = yield select(getCurrentLine)
    const currentLineNumber = yield select(getCurrentLineNumber)
    yield put(serialSend(currentLineNumber, currentLine))
  }
}

const despoolToSerialSaga = function*() {
  yield takeEvery(['DESPOOL', 'SPOOL'], onSpoolerChange)
}

export default despoolToSerialSaga
