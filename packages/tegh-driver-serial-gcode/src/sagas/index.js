import despoolToSerialSaga from './despool_to_serial_saga'
import pollTemperatureSaga from './poll_temperature_saga'
import serialErrorHandlerSaga from './serial_error_handler_saga'
import SerialReceiveSaga from './serial_receive_saga'

export const saga = (config) => function*() {
  yield all([
    call(despoolToSerialSaga),
    call(pollTemperatureSaga),
    call(serialErrorHandlerSaga),
    call(SerialReceiveSaga),
  ])
}
