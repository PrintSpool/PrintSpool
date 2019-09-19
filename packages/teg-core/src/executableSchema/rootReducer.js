import { Map, Record } from 'immutable'
import { mergeChildReducers } from '@d1plo1d/redux-loop-immutable'
import Debug from 'debug'

import { SET_CONFIG } from '../config/actions/setConfig'
import getAllReducers from '../pluginManager/selectors/getAllReducers'
import * as coreReducers from '../reducers'

const debug = Debug('teg:redux:action')

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
  let nextState = state
  let { reducers } = state

  if (action.type === SET_CONFIG) {
    reducers = getAllReducers(action.payload)
    nextState = createStateRecord(reducers, state)
  }

  debug(action.type)
  // console.log(action.type, '\n', reducers.map((v, k) => k).toList().toJS())
  return mergeChildReducers(nextState, action, reducers.toObject())
}

export default rootReducer
