import _ from 'lodash'

import { SET_CONFIG } from '../actions/setConfig'
import getPluginMiddleware from '../selectors/getPluginMiddleware'

const middlewareManagerMiddleware = (store) => {
  let chainedMiddleware = null

  return next => (action) => {
    if (action.type === SET_CONFIG) {
      const nextMiddleware = getPluginMiddleware(action.config)
      chainedMiddleware = _(nextMiddleware)
        .values()
        .reduce(
          (nextFn, middleware) => middleware(store)(nextFn),
          next,
        )
    }

    if (chainedMiddleware == null) return next(action)
    return chainedMiddleware(action)
  }
}

export default middlewareManagerMiddleware
