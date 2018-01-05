import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import Raven from "raven"
import createRavenMiddleware from "raven-for-redux";

import rootReducer from './reducers/'
import { onUncaughtException } from './helpers/crash_report'

const driverMiddleware = (storeContext) => {
  const { driver } = storeContext
  if (driver.middleware == null) return []
  return driver.middleware(storeContext)
}

const store = (storeContext) => {
  const { driver } = storeContext
  const sagaMiddleware = createSagaMiddleware({
    onError: onUncaughtException,
  })
  const middleware = [
    ...driverMiddleware(storeContext),
    sagaMiddleware,
  ]
  if (storeContext.config.uploadCrashReportsToDevs) {
    middleware.push(createRavenMiddleware(Raven, {
      stateTransformer: (state) => ({
        ...state,
        // log uses immutable JS for performance so it needs to be converted
        // in to js objects and arrays.
        log: state.log.toJS(),
      })
    }))
  }
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
