import { Record, Map } from 'immutable'
import { mergeChildReducers } from '@d1plo1d/redux-loop-immutable'

// components
import components from './components/reducers/componentsReducer'
import _pollTemperature from './components/reducers/pollTemperatureReducer'
import _pollPosition from './components/reducers/pollPositionReducer'
// serial
import _estopAndReset from './serial/reducers/estopAndResetReducer'
import _serialErrorHandler from './serial/reducers/serialErrorHandlerReducer'
import _serial from './serial/reducers/serialReducer'
import _simulatedDevice from './serial/reducers/simulatedDeviceReducer'
// spool
import _despoolToSerial from './spool/reducers/despoolToSerialReducer'
import _greeting from './spool/reducers/greetingReducer'
import _serialTimeout from './spool/reducers/serialTimeoutReducer'
import _throwOnInvalidGCode from './spool/reducers/throwOnInvalidGCodeReducer'

const reducers = {
  components,
  _pollTemperature,
  _pollPosition,
  _estopAndReset,
  _serialErrorHandler,
  _serial,
  _simulatedDevice,
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
