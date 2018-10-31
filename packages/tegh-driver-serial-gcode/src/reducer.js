import { Record, Map } from 'immutable'
import { mergeChildReducers } from 'redux-loop-immutable'

// peripherals
import peripherals from './peripherals/reducers/peripheralsReducer'
import _pollTemperature from './peripherals/reducers/pollTemperatureReducer'
// serial
import _estopAndReset from './serial/reducers/estopAndResetReducer'
import _serialErrorHandler from './serial/reducers/serialErrorHandlerReducer'
import _serial from './serial/reducers/serialReducer'
// spool
import _despoolToSerial from './spool/reducers/despoolToSerialReducer'
import _greeting from './spool/reducers/greetingReducer'
import _serialTimeout from './spool/reducers/serialTimeoutReducer'
import _throwOnInvalidGCode from './spool/reducers/throwOnInvalidGCodeReducer'

const reducers = {
  peripherals,
  _pollTemperature,
  _estopAndReset,
  _serialErrorHandler,
  _serial,
  _despoolToSerial,
  _greeting,
  _serialTimeout,
  _throwOnInvalidGCode,
}

const initialState = Record(
  Map(reducers).map(() => undefined).toJS(),
)()

const driverSerialGCodeReducer = (state = initialState, action) => (
  mergeChildReducers(state, action, reducers)
)

export default driverSerialGCodeReducer
