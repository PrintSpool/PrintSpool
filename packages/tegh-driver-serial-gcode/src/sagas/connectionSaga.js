import { effects } from 'redux-saga'
const { all, race, take, call } = effects

import * as connectedSagasByName from './connected_sagas/'

const lifecycleSaga = (selectors, { connectedSagasByName }) => {
  const connectedSagas = Object.values(connectedSagasByName)
    .map(saga => saga(selectors))

  return function*() {
    while(true) {
      yield take('SERIAL_OPEN')
      yield race({
        connected: all(
          connectedSagas.map(saga => call(saga))
        ),
        shutdown: take(['ESTOP', 'DRIVER_ERROR', 'SERIAL_CLOSE']),
      })
    }
  }
}

export default lifecycleSaga
