// @flow
import { effects } from 'tegh-daemon'

import spoolTemperatureQuery from '../actions/spool_temperature_query'
import serialSend from '../actions/serial_send'

const { put, takeEvery, takeLatest, select, call, delay } = effects

/*
 * Selectors for grabbing getState
 */

const getPollingInterval = (state) => (
  state.config.driver.temperaturePollingInterval
)

const hasTemperatureData = ({ type, data = null }) => (
  type === 'SERIAL_RECEIVE' && data && data.ok && data.temperatures != null
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
