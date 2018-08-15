import { Map, Record } from 'immutable'
import { mergeChildReducers } from 'redux-loop-immutable'

import { SET_CONFIG } from './core/config/actions/setConfig'
import getAllReducers from './core/config/selectors/getAllReducers'

const initialState = Record({
  config: null,
})()

const rootReducer = (state = initialState, action) => {
  /*
   * Do nothing until SET_CONFIG is called
   */
  if (state.config == null && action !== SET_CONFIG) return state

  let nextState = state
  const reducers = getAllReducers(action.config)

  /*
   * Reload the list of reducers on SET_CONFIG
   */
  if (action === SET_CONFIG) {
    const defaultValues = Map(reducers).mapValues(() => null)
    nextState = Record(defaultValues)(state)
  }

  return mergeChildReducers(nextState, action, reducers)
}

export default rootReducer
