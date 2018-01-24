// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call, delay } = effects

import firmwareErrorPattern from './patterns/firmware_error_pattern'
import hasTemperatureDataPattern from './patterns/has_temperature_data_pattern'
import spoolTemperatureQuery from '../actions/spool_temperature_query'
import {
  getPollingInterval
} from '../selectors'

const onTemperatureData = function*() {
  const interval = yield select(getPollingInterval)
  yield delay(interval)
  yield put(spoolTemperatureQuery())
}

const pollTemperatureSaga = function*() {
  while (true) {
    // await printer startup
    yield take('PRINTER_READY')
    // send intial temperature polling request
    yield put(spoolTemperatureQuery())
    // listen for temperature data from the printer forever unless it errors
    yield race([
      takeLatest(hasTemperatureDataPattern, onTemperatureData),
      take(firmwareErrorPattern),
    ])
  }
}

export default pollTemperatureSaga
