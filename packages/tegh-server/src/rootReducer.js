import _ from 'lodash'
import { combineReducers } from 'redux-immutable'

import * as wrappedReducers from './core/reducers'

export default (storeContext) => {
  const unwrap = wrapper => wrapper(storeContext)
  const reducers = _.mapValues(wrappedReducers, unwrap)
  return combineReducers(reducers)
})
