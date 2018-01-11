// @flow
import { effects } from 'tegh-daemon'

import serialSend from '../actions/serial_send'

const { put, takeEvery, takeLatest, select, call } = effects

const getCurrentSerialLineNumber = (state) => state.driver.currentLineNumber
const getCurrentTask = ({ spool }) => spool.allTasks.get(spool.currentTaskID)
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
  const currentTask = yield select(getCurrentTask)
  if (
    type === 'DESPOOL' && currentTask != null ||
    type === 'SPOOL' && shouldSendSpool
  ) {
    const currentSerialLineNumber = yield select(getCurrentSerialLineNumber)
    const currentLine = currentTask.data.get(currentTask.currentLineNumber)
    yield put(serialSend(currentSerialLineNumber, currentLine))
  }
}

const despoolToSerialSaga = function*() {
  yield takeEvery(['DESPOOL', 'SPOOL'], onSpoolerChange)
}

export default despoolToSerialSaga
