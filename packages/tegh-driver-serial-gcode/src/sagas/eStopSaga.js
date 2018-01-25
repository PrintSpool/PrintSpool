// @flow
import { effects } from 'redux-saga'
import { createEStopAction } from 'tegh-daemon'
const { put, takeEvery, takeLatest, select, call } = effects

import serialSend from '../actions/serialSend'

/*
 * Trigger an eStop action on M112 to emergency stop all of Tegh
 */
const eStopSaga = () => {
  const pattern = ({type, code}) => (
    type === 'SERIAL_SEND' &&
    code === 'M112'
  )

  const onM112 = function*() {
    yield put(createEStopAction())
  }

  return function*() {
    yield takeEvery(pattern, onM112)
  }
}

export default eStopSaga
