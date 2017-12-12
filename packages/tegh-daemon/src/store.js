import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers/'

const store = ({ config, driver }) => {
  const sagaMiddleware = createSagaMiddleware()
  sagaMiddleware.run(driver.saga())
  return createStore(
    rootReducer({ config, driver }),
    applyMiddleware(
      ...driver.middleware({ config }),
      sagaMiddleware,
    ),
  )
}

export default store
