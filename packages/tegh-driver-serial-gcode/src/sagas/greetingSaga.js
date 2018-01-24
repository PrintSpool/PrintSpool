// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call, delay, take } = effects

import spoolTemperatureQuery from '../actions/spool_temperature_query'
import serialSend from '../actions/serial_send'

const greetingSaga = ({
  isReady,
}) => {
  const onSerialReceive = function*(action) {
    const ready = yield select(isReady)
    const responseType = action.data.type

    if (ready) return
    if (responseType === 'greeting') {
      yield put(serialSend('M110 N0', { lineNumber: false }))
    } else if (responseType === 'ok') {
      yield put({ type: 'PRINTER_READY' })
    }
  }

  return function*() {
    yield takeEvery('SERIAL_RECEIVE', onSerialReceive)
  }
}

export default greetingSaga
