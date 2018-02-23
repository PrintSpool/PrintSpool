import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'

import rootReducer from './rootReducer'

const createTeghStore = (storeContext) => {
  const { driver, errorHandler } = storeContext

  const sagaMiddleware = createSagaMiddleware({
    onError: (e) => setImmediate(() => errorHandler(e)),
  })

  const store = createStore(
    rootReducer(storeContext),
    applyMiddleware(
      ...driver.middleware(storeContext),
      ReduxThunk,
      sagaMiddleware,
    ),
  )

  for (const saga of driver.sagas(storeContext)) {
    sagaMiddleware.run(saga)
  }

  return store
}

export default createTeghStore
