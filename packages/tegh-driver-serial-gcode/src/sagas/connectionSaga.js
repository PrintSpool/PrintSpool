import { effects } from 'redux-saga'
const { all, race, take, call, cancel, fork, join } = effects

import * as connectedSagaIndex from './connected_sagas/'

const connectionSaga = (selectors, sagasConfig = {
  connectedSagasByName: connectedSagaIndex,
}) => {

  const connectedSagas = Object.values(sagasConfig.connectedSagasByName)
    .map(saga => saga(selectors))

  return function*() {
    while ( yield take('SERIAL_OPEN') ) {
      yield race({
        task: all(connectedSagas.map(saga => call(saga))),
        cancel: take(['ESTOP', 'DRIVER_ERROR', 'SERIAL_CLOSE']),
      })
    }
  }
}

export default connectionSaga
