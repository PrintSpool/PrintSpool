import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'

import rootReducer from './reducers/'

const driverMiddleware = (storeContext) => {
  const { driver } = storeContext
  if (driver.middleware == null) return []
  return driver.middleware(storeContext)
}

const store = (storeContext) => {
  const { driver, errorHandler } = storeContext
  const sagaMiddleware = createSagaMiddleware({
    onError: (e) => setImmediate(() => errorHandler(e)),
  })
  const middleware = [
    ...driverMiddleware(storeContext),
    sagaMiddleware,
  ]
  // TODO: replace Raven crash logging
  // if (storeContext.config.uploadCrashReportsToDevs) {
  //   middleware.push(createRavenMiddleware(Raven, {
  //     stateTransformer: (state) => ({
  //       ...state,
  //       // log uses immutable JS for performance so it needs to be converted
  //       // in to js objects and arrays.
  //       log: state.log.toJS(),
  //       spool: state.spool.toJS(),
  //     })
  //   }))
  // }
  const store = createStore(
    rootReducer(storeContext),
    applyMiddleware(...middleware),
  )
  if (driver.sagas != null) {
    for (const saga of driver.sagas(storeContext)) {
      sagaMiddleware.run(saga)
    }
  }
  return store
}

export default store
