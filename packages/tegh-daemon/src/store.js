import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import RavenMiddleware from 'redux-raven-middleware'

import rootReducer from './reducers/'
import { onUncaughtException } from './helpers/crash_report'

const RAVEN_DSN = 'https://a276b5318a6b4d93b2d7b28c9de1f678@sentry.io/266958'

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
    middleware.push(RavenMiddleware(RAVEN_DSN, {}, {
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
