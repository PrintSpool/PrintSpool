// @flow
import { effects } from 'redux-saga'
import { createEStopAction } from 'tegh-server'
const { put, takeEvery, takeLatest, select, call, delay } = effects

import serialSend from '../actions/serialSend'

/*
 * Trigger an eStop action on M112 to emergency stop all of Tegh
 */
const eStopSaga = () => {
  const onSerialSend = function*({ type, code }) {
    if (type === 'SERIAL_SEND' && code === 'M112') {
      yield put(createEStopAction())
    }
    /*
     * eStops require a reset of the serial connection
     * to restart the printer so we automatically do this for all M999s just to
     * be safe.
     */
    if (type === 'SERIAL_SENT' && code === 'M999') {
      yield put({
        type: 'SERIAL_RESET'
      })
    }
  }

  return function*() {
    yield takeEvery(['SERIAL_SEND', 'SERIAL_SENT'], onSerialSend)
  }
}

export default eStopSaga
