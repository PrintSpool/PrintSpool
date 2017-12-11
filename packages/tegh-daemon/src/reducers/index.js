import { combineReducers } from 'redux'
import spoolReducer from './spool_reducer'
import configReducer from './config_reducer'

export default ({ config, driver }) => combineReducers({
  spool: spoolReducer,
  config: configReducer(config),
  driver: driver.reducer(config),
})
