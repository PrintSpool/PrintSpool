import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'

import rootReducer from './reducers/'
import loggerMiddleware from './middleware/logger_middleware'
import onUncaughtException from './helpers/on_uncaught_exception'

const driverMiddleware = ({ config, driver }) => {
  if (driver.middleware == null) return []
  return driver.middleware({ config })
}

const store = ({ config, driver }) => {
  const sagaMiddleware = createSagaMiddleware({
    onError: onUncaughtException,
  })
  const middleware = [
    ...driverMiddleware({ config, driver }),
    sagaMiddleware,
    loggerMiddleware({ config }),
  ]
  const store = createStore(
    rootReducer({ config, driver }),
    applyMiddleware(...middleware),
  )
  if (driver.sagas != null) {
    for (const saga of driver.sagas({ config })) {
      sagaMiddleware.run(saga)
    }
  }
  return store
}

export default store
