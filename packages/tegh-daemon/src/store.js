import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'

import rootReducer from './reducers/'
import loggerMiddleware from './middleware/logger_middleware'
import onUncaughtException from './helpers/on_uncaught_exception'

const driverMiddleware = ({ config, driver }) => {
  if (driver.middleware == null) return []
  return driver.middleware({ config })
}

const sagaMiddleware = ({ driver }) => {
  const middleware = createSagaMiddleware({
    onError: onUncaughtException,
  })
  if (driver.saga != null) {
    middleware.run(driver.saga())
  }
  return middleware
}

const store = ({ config, driver }) => {
  const middleware = [
    ...driverMiddleware({ config, driver }),
    sagaMiddleware({ config, driver }),
    loggerMiddleware({ config }),
  ]
  return createStore(
    rootReducer({ config, driver }),
    applyMiddleware(...middleware),
  )
}

export default store
