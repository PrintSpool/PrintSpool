import _ from 'lodash'

// TODO: use a combineReducers function that builds a Record instead of a Map
// import { combineReducers } from 'redux-immutable'

import { combineReducers } from 'redux'

import * as wrappedReducers from './core/reducers'

export default (storeContext) => {
  const unwrap = wrapper => wrapper(storeContext)
  const reducers = _.mapValues({
    ...wrappedReducers,
    driver: storeContext.driver.reducer,
  }, unwrap)
  return combineReducers(reducers)
}
