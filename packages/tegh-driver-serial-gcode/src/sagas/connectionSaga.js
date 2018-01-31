import { effects } from 'redux-saga'
const { all, race, take, call } = effects

import * as connectedSagaIndex from './connected_sagas/'

const connectionSaga = (selectors, sagasConfig = {
  connectedSagasByName: connectedSagaIndex,
}) => {

  const connectedSagas = Object.values(sagasConfig.connectedSagasByName)
    .map(saga => saga(selectors))

  return function*() {
    while(true) {
      yield take('SERIAL_OPEN'),
      yield race({
        connected: all(
          connectedSagas.map(saga => call(saga)),
        ),
        shutdown: take(['ESTOP', 'DRIVER_ERROR', 'SERIAL_CLOSE']),
      })
    }
  }
}

export default connectionSaga
