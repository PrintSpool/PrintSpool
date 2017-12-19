// @flow
import { delay } from 'redux-saga'
import {
  put,
  takeEvery,
  takeLatest,
  select,
  all,
  call,
} from 'redux-saga/effects'

import spoolTemperatureQuery from '../actions/spool_temperature_query'
import serialSend from '../actions/serial_send'

/*
 * Selectors for grabbing getState
 */

const getPollingInterval = (state) => (
  state.config.driver.temperaturePollingInterval
)

const hasTemperatureData = ({ type, data = null }) => (
  type === 'SERIAL_RECEIVE' && data && data.temperatures != null
)

const onTemperatureData = function*() {
  const interval = yield select(getPollingInterval)
  yield delay(interval)
  yield put(spoolTemperatureQuery())
}

const pollTemperatureSaga = function*() {
  yield takeLatest(hasTemperatureData, onTemperatureData)
}

export default pollTemperatureSaga
