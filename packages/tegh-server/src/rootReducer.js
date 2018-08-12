import { Record } from 'immutable'
import _ from 'lodash'

import { SET_CONFIG } from './core/config/actions/setConfig'
import getAllReducers from './core/config/selectors/getAllReducers'

const initialState = Record({
  config: null,
})()

const rootReducer = (state = initialState, action) => {
  let nextState = state
  const reducers = getAllReducers(action.config)

  /*
   * Reload the list of reducers on SET_CONFIG
   */
  if (action === SET_CONFIG) {
    const defaultValues = _.mapValues(reducers, () => null)
    nextState = Record(defaultValues)(state)
  }

  /* Combine reducers */
  nextState = nextState.map((childState, key) => {
    const reducer = reducers[key]
    return reducer(childState, action)
  })

  return nextState
}

export default rootReducer
