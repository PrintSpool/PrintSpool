import { Map, Record } from 'immutable'
import { mergeChildReducers } from 'redux-loop-immutable'

import {
  SET_CONFIG,
  getAllReducers,
  reducers as coreReducers,
} from 'tegh-core'

// import { SET_CONFIG } from './core/config/actions/setConfig'
// import getAllReducers from './core/pluginManager/selectors/getAllReducers'

const createStateRecord = (reducers, previousState = Record({})()) => (
  Record({
    reducers,
    ...reducers.map(() => undefined).toObject(),
  })(
    Map(previousState).remove('reducers').toObject(),
  )
)

const initialState = createStateRecord(Map(coreReducers))

const rootReducer = (state = initialState, action) => {
  let { reducers } = state
  let nextState = state

  if (action.type === SET_CONFIG) {
    reducers = getAllReducers(action.payload)
    nextState = createStateRecord(reducers, state)
  }

  // console.log(action.type)
  // console.log(action.type, '\n', reducers.map((v, k) => k).toList().toJS())
  return mergeChildReducers(nextState, action, reducers.toObject())
}

export default rootReducer
