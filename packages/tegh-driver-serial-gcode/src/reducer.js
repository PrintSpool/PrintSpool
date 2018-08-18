import { Record } from 'immutable'
import { mergeChildReducers } from 'redux-loop-immutable'

// peripherals
import peripherals from './peripherals/reducers/peripheralsReducer'
import _pollTemperature from './peripherals/reducers/pollTemperatureReducer'
// status
import _estop from './status/reducers/eStopReducer'
import _serialErrorHandler from './status/reducers/serialErrorHandlerReducer'
import status from './status/reducers/statusReducer'
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
