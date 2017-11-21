import { combineReducers } from 'redux'
import configReducer from './config_reducer'

export default ({config, driver}) => combineReducers({
  config: configReducer(config),
  driver: driver.reducer(config),
})
