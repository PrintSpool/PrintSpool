import { combineReducers } from 'redux'
import spoolReducer from './spool_reducer'
import configReducer from './config_reducer'
import logReducer from './log_reducer'

export default (storeContext) => combineReducers({
  spool: spoolReducer,
  config: configReducer(storeContext),
  log: logReducer(storeContext),
  driver: storeContext.driver.reducer(storeContext),
})
