import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'

import {
  configMiddleware,
  middlewareManagerMiddleware,
  coreSagas,
} from 'tegh-core'

import rootReducer from './rootReducer'

const createTeghStore = () => {
  // const sagaMiddleware = createSagaMiddleware({
  //   onError: e => setImmediate(() => errorHandler(e)),
  // })

  const sagaMiddleware = createSagaMiddleware()

  const store = createStore(
    rootReducer,
    applyMiddleware(
      configMiddleware,
      middlewareManagerMiddleware,
      ReduxThunk,
      sagaMiddleware,
    ),
  )

  const sagas = Object.values(coreSagas)

  // eslint-disable-next-line no-restricted-syntax
  for (const saga of sagas) {
    sagaMiddleware.run(saga)
  }

  return store
}

export default createTeghStore
