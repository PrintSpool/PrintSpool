import despoolToSerialSaga from './despool_to_serial_saga'
import pollTemperatureSaga from './poll_temperature_saga'
import serialErrorHandlerSaga from './serial_error_handler_saga'
import serialReceiveSaga from './serial_receive_saga'

const sagas = ({ config }) => ([
  despoolToSerialSaga,
  pollTemperatureSaga,
  serialErrorHandlerSaga,
  serialReceiveSaga,
])

export default sagas
