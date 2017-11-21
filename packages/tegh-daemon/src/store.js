import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers/'

const store = ({config, driver}) => {
  return createStore(
    rootReducer({config, driver}),
    initialStateFromConfig,
    applyMiddleware(
      driver.middleware,
    )
  )
}

export default store
