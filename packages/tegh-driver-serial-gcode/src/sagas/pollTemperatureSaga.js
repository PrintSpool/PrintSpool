// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call, delay } = effects

import firmwareErrorPattern from './patterns/firmwareErrorPattern'
import hasTemperatureDataPattern from './patterns/hasTemperatureDataPattern'
import spoolTemperatureQuery from '../actions/spoolTemperatureQuery'

const pollTemperatureSaga = ({
  getPollingInterval,
}) => {
  const onTemperatureData = function*(action) {
    if (action.type !== 'PRINTER_READY') {
      const interval = yield select(getPollingInterval)
      yield delay(interval)
    }
    yield put(spoolTemperatureQuery())
  }

  return function*() {
    yield takeLatest(
      [hasTemperatureDataPattern, 'PRINTER_READY'],
      onTemperatureData
    )
  }
}

export default pollTemperatureSaga
