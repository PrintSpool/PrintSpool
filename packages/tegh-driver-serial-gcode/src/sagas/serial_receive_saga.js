// @flow
import { effects } from 'redux-saga'

const { put, takeEvery, takeLatest, select, call } = effects


const getCurrentLine = (state) => state.spool.currentLine
const getCurrentLineNumber = (state) => state.spool.currentLineNumber
const getReady = (state) => state.driver.ready
const getGreetingToReadyDelay = (state) =>
  state.config.driver.delayFromGreetingToReady

/*
 * Intercepts SERIAL_RECEIVE actions, parses their data (appending it
 * as `action.parsedData`) and dispatches actions.
 *
 * - dispatches PRINTER_READY and SPOOL once the printer is booted
 * - dispatches SPOOL for temperature polling.
 * - dispatches DESPOOL on acknowledgment of previous line.
 * - dispatches SERIAL_SEND to resend the previous line if the printer
 *   requests a resend.
 *
 * SERIAL_RECEIVE actions are appended to:
 *  {
 *    data: STRING // raw gcode
 *    parsedData: RxParserParsedData // see rx_parser
 *  }
 */
export const onSerialRecieve = function*(action) {
  const ready = yield select(getReady)
  const { data } = action

  /*
   * After a greeting is received from the printer the middleware waits
   * delayFromGreetingToReady to declare the printer ready to receive
   * gcodes
   *
   * Temperature polling also begins at that time.
   */
  if (!ready) {
    if (!data.isGreeting) return
    const delayFromGreetingToReady = yield select(getGreetingToReadyDelay)
    yield delay(delayFromGreetingToReady)
    yield put({ type: 'PRINTER_READY' })
    // Send the initial temperature poll
    yield put(createSpoolTemperatureQueryAction())
  } else if (data.isAck) {
    yield put({ type: 'DESPOOL' })
  } else if (data.isResend) {
    const currentLine = yield select(getCurrentLine)
    const previousLineNumber = yield select(getCurrentLineNumber) - 1
    /*
     * Tegh only sends one line at a time. If a resend is requested for a
     * different line number then this is likely an issue of the printer's
     * firmware.
     */
    if (data.lineNumber !== previousLineNumber) {
      throw new Error(
        `resend line number ${data.lineNumber} `+
        `does not match current line number ${previousLineNumber}`
      )
    }
    yield call(sendLine, previousLineNumber, currentLine)
  }
}

const serialReceiveSaga = function*() {
  yield takeEvery('SERIAL_RECEIVE', onSerialRecieve)
}

export default serialReceiveSaga
