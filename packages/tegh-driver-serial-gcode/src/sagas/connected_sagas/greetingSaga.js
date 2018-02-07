// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call, delay, take } = effects

import { forkEvery } from '../helpers/'
import spoolTemperatureQuery from '../../actions/spoolTemperatureQuery'
import serialSend from '../../actions/serialSend'

const greetingSaga = ({
  isReady,
}) => {
  const onSerialReceive = function*(action) {
    const ready = yield select(isReady)
    const responseType = action.data.type

    if (ready) return
    if (responseType === 'greeting') {
      console.log('RECEIVED A GREETING', action.data.raw)
      yield delay(50)
      yield put(serialSend('M110 N0', { lineNumber: false }))
    } else if (responseType === 'ok') {
      yield put({ type: 'PRINTER_READY' })
    }
  }

  return function*() {
    yield forkEvery('SERIAL_RECEIVE', onSerialReceive)
  }
}

export default greetingSaga
