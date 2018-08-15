import { Record } from 'immutable'
import { mergeChildReducers } from 'redux-loop-immutable'

// printer/peripherals
import peripherals from './printer/peripherals/reducers/peripheralsReducer'
import _pollTemperature from './printer/peripherals/reducers/pollTemperatureReducer'
// printer/status
import _estop from './printer/status/reducers/eStopReducer'
import _serialErrorHandler from './printer/status/reducers/serialErrorHandlerReducer'
import status from './printer/status/reducers/statusReducer'
// spool
import _despoolToSerial from './spool/reducers/despoolToSerialReducer'
import _serialTimeout from './spool/reducers/serialTimeoutReducer'

const reducers = {
  peripherals,
  _pollTemperature,
  _estop,
  _serialErrorHandler,
  status,
  _despoolToSerial,
  _serialTimeout,
}

const initialState = Record(Object.mapValues(reducers, () => null))()

const driverSerialGCodeReducer = (state = initialState, action) => (
  mergeChildReducers(state, action, reducers)
)

export default driverSerialGCodeReducer
