// @flow
import { effects } from 'redux-saga'
const { put, takeEvery, takeLatest, select, call, delay, take, race } = effects

import numberedLineSendPattern from './patterns/numberedLineSendPattern'
import serialSend from '../actions/serialSend'
import createSerialTimeoutAction from '../actions/createSerialTimeoutAction'

const serialTimeoutSaga = ({
  getLongRunningCodes,
  getSerialTimeout,
}) => {
  const onLineSend = function*(action) {
    const longRunningCodes = yield select(getLongRunningCodes)
    const serialTimeoutConfig = yield select(getSerialTimeout)
    const { tickleAttempts } = serialTimeoutConfig
    const long = longRunningCodes.includes(action.code)
    const timeoutName = `${long ? 'longRunning' : 'fast'}CodeTimeout`
    const timeoutPeriod = serialTimeoutConfig[timeoutName]
    if (typeof timeoutPeriod != 'number') {
      throw new Error(`${timeoutName} must be a number`)
    }
    for (const i of Array(tickleAttempts)) {
      const { response } = yield race({
        response: take(({ type, data }) =>
          type === 'SERIAL_RECEIVE' &&
          data.type === 'ok'
        ),
        timeout: delay(timeoutPeriod),
      })
      if (response != null) return
      yield put({
        ...serialSend('M105', { lineNumber: false }),
        tickle: true,
      })
    }
    yield put(createSerialTimeoutAction())
  }


  return function*() {
    yield takeLatest(numberedLineSendPattern, onLineSend)
  }
}

export default serialTimeoutSaga
