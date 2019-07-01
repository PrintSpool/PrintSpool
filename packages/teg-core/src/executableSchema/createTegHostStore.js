import { createStore, applyMiddleware, compose } from 'redux'
import { install as installReduxLoop } from 'redux-loop'
import ReduxThunk from 'redux-thunk'

import rootReducer from './rootReducer'

const createTegHostStore = () => {
  const enhancer = compose(
    applyMiddleware(
      ReduxThunk,
    ),
    installReduxLoop({
      config: {
        DONT_LOG_ERRORS_ON_HANDLED_FAILURES: true,
      },
    }),
  )

  const store = createStore(
    rootReducer,
    enhancer,
  )

  return store
}

export default createTegHostStore
