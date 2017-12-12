import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers/'

const driverMiddleware = ({ config, driver }) => {
  if (driver.middleware == null) return []
  return driver.middleware({ config })
}

const sagaMiddleware = ({ driver }) => {
  const middleware = createSagaMiddleware()
  if (driver.saga != null) {
    middleware.run(driver.saga())
  }
  return middleware
}

const store = ({ config, driver }) => {
  return createStore(
    rootReducer({ config, driver }),
    applyMiddleware(
      ...driverMiddleware({ config, driver }),
      sagaMiddleware({ config, driver }),
    ),
  )
}

export default store
