import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import * as coreSagas from './core/sagas'

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

  const sagas = [
    ...coreSagas,
    ...driver.sagas(storeContext),
  ]

  for (const saga of sagas) {
    sagaMiddleware.run(saga)
  }

  return store
}

export default createTeghStore
