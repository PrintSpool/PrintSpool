// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call, delay, take } = effects

import spoolTemperatureQuery from '../actions/spoolTemperatureQuery'
import serialSend from '../actions/serialSend'

const serialReceiveSaga = ({
  isReady,
  getCurrentLine,
  getCurrentSerialLineNumber,
}) => {
  /*
   * Intercepts SERIAL_RECEIVE actions, parses their data (appending it
   * as `action.parsedData`) and dispatches actions.
   *
   * - dispatches SPOOL for temperature polling.
   * - dispatches DESPOOL on acknowledgment of previous line.
   * - dispatches SERIAL_SEND to resend the previous line if the printer
   *   requests a resend.
   */
  const onSerialRecieve = function*(action) {
    const ready = yield select(isReady)
    if (!ready) return
    const { data } = action
    if (data.type === 'ok') {
      yield put({ type: 'DESPOOL' })
    } else if (data.type === 'resend') {
      const currentLine = yield select(getCurrentLine)
      const previousLineNumber = (yield select(getCurrentSerialLineNumber)) - 1
      /*
       * Tegh only sends one line at a time. If a resend is requested for a
       * different line number then this is likely an issue of the printer's
       * firmware.
       */
      if (data.lineNumber !== previousLineNumber) {
        throw new Error(
          `resend line number ${data.lineNumber} `+
          `does not match previous line number ${previousLineNumber}`
        )
      }
      yield put(serialSend(currentLine, {lineNumber: previousLineNumber}))
    }
  }

  return function*() {
    yield takeEvery('SERIAL_RECEIVE', onSerialRecieve)
  }
}

export default serialReceiveSaga
