import { createStore, applyMiddleware, compose } from 'redux'
import { install as installReduxLoop } from 'redux-loop'
import ReduxThunk from 'redux-thunk'

import rootReducer from './rootReducer'

const createTeghStore = () => {
  const enhancer = compose(
    applyMiddleware(
      ReduxThunk,
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
