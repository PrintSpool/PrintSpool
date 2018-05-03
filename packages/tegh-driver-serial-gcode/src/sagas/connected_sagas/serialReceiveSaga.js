// @flow
import { effects } from 'redux-saga'
import { driverError } from 'tegh-server'
const { put, takeEvery, takeLatest, select, call, delay, take } = effects

import { despoolTask } from 'tegh-server'

import { forkEvery } from '../helpers/'
import spoolTemperatureQuery from '../../actions/spoolTemperatureQuery'
import serialSend from '../../actions/serialSend'

const serialReceiveSaga = ({
  isReady,
  shouldIgnoreOK,
  getCurrentLine,
  getCurrentSerialLineNumber,
  getCurrentFileName,
  getCurrentFileLineNumber,
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
    switch(data.type) {
      case 'ok': {
        const ignoreNextOK = yield select(shouldIgnoreOK)
        if (ignoreNextOK) return
        yield put(despoolTask())
        return
      }
      case 'resend': {
        const currentLine = yield select(getCurrentLine)
        const currentSerialLineNumber = yield select(getCurrentSerialLineNumber)
        const previousSerialLineNumber = currentSerialLineNumber - 1
        // wait for the ok sent after the resend (see marlinFixture.js)
        yield take(action =>
          action.type === 'SERIAL_RECEIVE' && action.data.type === 'ok'
        )
        /*
         * Tegh only sends one line at a time. If a resend is requested for a
         * different line number then this is likely an issue of the printer's
         * firmware.
         */
        if (data.lineNumber !== previousSerialLineNumber) {
          throw new Error(
            `resend line number ${data.lineNumber} `+
            `does not match previous line number ${previousSerialLineNumber}`
          )
        }
        yield put(serialSend(currentLine, {
          lineNumber: previousSerialLineNumber,
        }))
        return
      }
      case 'error': {
        const fileName = yield select(getCurrentFileName)
        const fileLineNumber = yield select(getCurrentFileLineNumber)
        const error = driverError({
          code: 'FIRMWARE_ERROR',
          message: (
            `${fileName}:${fileLineNumber}: `+
            action.data.raw
          ),
        })
        yield put(error)
        return
      }
      default: {
        return
      }
    }
  }

  return function*() {
    yield forkEvery('SERIAL_RECEIVE', onSerialRecieve)
  }
}

export default serialReceiveSaga
