// @flow
import { effects } from 'redux-saga'
import { createEStopAction } from 'tegh-daemon'
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
      const serialSendAction = serialSend(currentLine, { lineNumber })
      /*
       * Send M112 Emergency Stops without a line number so that they will
       * be executed by the printer immediately without the opportunity for a
       * line number mismatch to cause an error and potentially prevent the
       * estop.
       */
      if (serialSendAction.code === 'M112') {
        yield put(serialSend(currentLine, { lineNumber: false }))
        yield put(createEStopAction())
      } else {
        yield put(serialSendAction)
      }
    }
  }

  return function*() {
    yield takeEvery(['DESPOOL', 'SPOOL'], onSpoolerChange)
  }
}

export default despoolToSerialSaga
