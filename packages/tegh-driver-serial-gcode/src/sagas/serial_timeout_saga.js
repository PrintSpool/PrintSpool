// @flow
import { effects } from 'redux-saga'

import serialSend from '../actions/serial_send'

const { put, takeEvery, takeLatest, select, call, delay, take, race } = effects

const getSerialTimeout = state => state.config.driver.serialTimeout
const getLongRunningCodes = state => state.config.driver.longRunningCodes


const onLineSend = function*(action) {
  const longRunningCodes = yield select(getLongRunningCodes)
  const {
    tickleAttempts,
    fastGCodeTimeout,
    longRunningCodeTimeout,
  } = yield select(getSerialTimeout)
  const long = longRunningCodes.includes(action.code)
  const timeoutPeriod = long ? longRunningCodeTimeout : fastGCodeTimeout
  for (const i of Array(tickleAttempts)) {
    const { response } = yield race({
      response: take(({ type, data }) =>
        type === 'SERIAL_RECEIVE' &&
        data.type === 'ok'
      ),
      timeout: delay(timeoutPeriod),
    })
    if (response != null) return
    yield put(serialSend('M105', { lineNumber: false }))
  }
  yield put({
    type: 'SERIAL_TIMEOUT'
  })
}


const serialTimeoutSaga = function*() {
  const pattern = action => (
    action.type === 'SERIAL_SEND' &&
    action.lineNumber !== false
  )
  yield takeLatest(pattern, onLineSend)
}

export default serialTimeoutSaga
