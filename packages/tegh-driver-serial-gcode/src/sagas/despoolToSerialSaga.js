// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call } = effects

import serialSend from '../actions/serialSend'

const despoolToSerialSaga = ({
  shouldSendSpooledLineToPrinter,
  getCurrentLine,
  getCurrentSerialLineNumber,
  isEmergency,
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
      const emergency = yield select(isEmergency)
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
    yield takeEvery(['DESPOOL', 'SPOOL'], onSpoolerChange)
  }
}

export default despoolToSerialSaga
