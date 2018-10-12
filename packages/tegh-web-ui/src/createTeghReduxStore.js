import { createStore, applyMiddleware, compose } from 'redux'

import { install as installReduxLoop, combineReducers } from 'redux-loop'

import { reducer as formReducer } from 'redux-form'

import { createHashHistory } from 'history'
import { routerReducer, routerMiddleware } from '@d1plo1d/connected-react-router'

import keysReducer from './reducers/keysReducer'
import loadKeys from './actions/loadKeys'

export const history = createHashHistory()

// eslint-disable-next-line no-undef, no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const createTeghReduxStore = () => {
  const rootReducer = combineReducers({
    form: formReducer,
    router: routerReducer(history),
    keys: keysReducer,
  })

  const enhancer = composeEnhancers(
    installReduxLoop(),
    applyMiddleware(
      routerMiddleware(history),
    ),
  )

  const store = createStore(
    rootReducer,
    enhancer,
  )

  store.dispatch(loadKeys())

  return store
}

export default createTeghReduxStore
