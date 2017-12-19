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

import serialSend from '../actions/serial_send'

/*
 * Selectors for grabbing getState
 */

const getPollingInterval = (state) => (
  state.config.driver.temperaturePollingInterval
)
const getGreetingToReadyDelay = (state) => (
  state.config.driver.delayFromGreetingToReady
)

import spoolTemperatureQuery from '../actions/spool_temperature_query'

const hasTemperatureData = ({ type, data = null }) => (
  type === 'SERIAL_RECEIVE' && data.temperatures != null
)

export const onTemperatureData = function*() {
  const interval = yield select(getPollingInterval)
  yield delay(interval)
  yield put(spoolTemperatureQuery())
}

const pollTemperatureSaga = function*() {
  yield takeLatest(hasTemperatureData, pollTemperature)
}

export default pollTemperatureSaga
