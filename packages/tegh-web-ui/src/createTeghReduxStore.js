import { createStore, combineReducers, applyMiddleware } from 'redux'
import { reducer as formReducer } from 'redux-form'

import { createHashHistory } from 'history'
import { routerReducer, routerMiddleware } from '@d1plo1d/connected-react-router'

export const history = createHashHistory()

const createTeghReduxStore = () => {
  const rootReducer = combineReducers({
    form: formReducer,
    router: routerReducer(history),
  })

  return createStore(
    rootReducer,
    applyMiddleware(
      routerMiddleware(history),
    ),
  )
}

export default createTeghReduxStore
