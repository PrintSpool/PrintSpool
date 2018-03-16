// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call } = effects

import { SPOOL_TASK } from 'tegh-server'
import { DESPOOL_TASK } from 'tegh-server'

import serialSend from '../actions/serialSend'

const despoolToSerialSaga = ({
  shouldSendSpooledLineToPrinter,
  getCurrentLine,
  getCurrentSerialLineNumber,
  isEmergency,
  isReady,
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
      type === DESPOOL_TASK && currentLine != null ||
      type === SPOOL_TASK && shouldSendSpool
    ) {
      const lineNumber = yield select(getCurrentSerialLineNumber)
      const emergency = yield select(isEmergency)
      const ready = yield select(isReady)
      if (!ready && !emergency) return
      /*
       * Send emergency GCodes without line numbers since the printer may be in
       * an unknown state which may include a line number mismatch.
       *
       * M112 Emergency Stops without a line number so that it will
       * be executed by the printer immediately without the opportunity for a
       * line number mismatch to cause an error and potentially prevent the
       * estop.
       */
      const serialSendAction = serialSend(currentLine, {
        lineNumber: emergency ? false : lineNumber
      })
      yield put(serialSendAction)
    }
  }

  return function*() {
    yield takeEvery([DESPOOL_TASK, SPOOL_TASK], onSpoolerChange)
  }
}

export default despoolToSerialSaga
