import { Map, Record } from 'immutable'
import { mergeChildReducers } from 'redux-loop-immutable'

import {
  SET_CONFIG,
  getAllReducers,
  reducers as coreReducers,
} from 'tegh-core'

// import { SET_CONFIG } from './core/config/actions/setConfig'
// import getAllReducers from './core/pluginManager/selectors/getAllReducers'

const initialState = Record({
  config: undefined,
})()

const rootReducer = (state = initialState, action) => {
  // console.log('root reducer', action)
  let reducers = null
  let nextState = state

  /*
   * Do nothing until SET_CONFIG is called
   */
  if (state.config == null) {
    reducers = Map({ config: coreReducers.config })
  } else {
    reducers = Map(getAllReducers(action.config))

    /*
     * Reload the list of reducers on SET_CONFIG
     */
    // TODO: do not reset the entire state tree on config change.
    if (action === SET_CONFIG) {
      const defaultValues = reducers.mapValues(() => undefined)
      nextState = Record(defaultValues)(state)
    }
  }

  console.log(nextState)
  return mergeChildReducers(nextState, action, reducers.toObject())
}

export default rootReducer
