import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers/'

const store = ({config, driver}) => {
  return createStore(
    rootReducer({config, driver}),
    applyMiddleware(
      ...driver.middleware(config),
    ),
  )
}

export default store
