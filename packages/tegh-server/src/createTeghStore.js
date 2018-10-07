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
      ReduxThunk,
      configMiddleware,
    ),
    installReduxLoop(),
  )

  const store = createStore(
    rootReducer,
    enhancer,
  )

  return store
}

export default createTeghStore
