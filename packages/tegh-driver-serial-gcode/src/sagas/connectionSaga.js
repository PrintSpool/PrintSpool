import * as connectedSagasByName from './connected_sagas/'

const connectedSagas = (selectors) => (
  Object.values(connectedSagasByName).map(saga => saga(selectors))
)

const lifecycleSaga = (selectors) => {
  return function*() {
    while(true) {
      yield take('SERIAL_OPEN')
      yield race({
        connected: all(connectedSagas(selectors)),
        shutdown: take(['ESTOP', 'DRIVER_ERROR', 'SERIAL_CLOSE']),
      })
    }
  }
}

export default lifecycleSaga
