// @flow
import { effects } from 'redux-saga'
import { createEStopAction } from 'tegh-daemon'
const { put, takeEvery, takeLatest, select, call } = effects

import serialSend from '../actions/serialSend'

/*
 * Trigger an eStop action on M112 to emergency stop all of Tegh
 */
const eStopSaga = ({
  isEStopped,
}) => {
  const onSerialSend = function*({ code }) {
    if (code === 'M112') {
      yield put(createEStopAction())
    }
    /* M999 Stop Restart: eStops require a reset of the serial connection
     * to restart the printer so we automatically do this on M999
     */
    if (code === 'M999') {
      const eStopped = yield select(isEStopped)
      if (!eStopped) return
      yield put({
        type: 'SERIAL_RESET'
      })
    }
  }

  return function*() {
    yield takeEvery('SERIAL_SEND', onSerialSend)
  }
}

export default eStopSaga
