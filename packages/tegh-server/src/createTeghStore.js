import { createStore, applyMiddleware, compose } from 'redux'
import { install as installReduxLoop } from 'redux-loop'
import ReduxThunk from 'redux-thunk'

import {
  configMiddleware,
} from 'tegh-core'

import rootReducer from './rootReducer'

const createTeghStore = () => {
  const enhancer = compose(
    applyMiddleware(
      configMiddleware,
      ReduxThunk,
    ),
    installReduxLoop,
  )

  const store = createStore(
    rootReducer,
    null,
    enhancer,
  )

  return store
}

export default createTeghStore
