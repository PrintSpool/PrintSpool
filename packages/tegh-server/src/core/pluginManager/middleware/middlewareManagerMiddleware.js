import { PLUGINS_LOADED } from '../actions/pluginsLoaded'
import getMiddleware from '../selectors/getMiddleware'

const middlewareManagerMiddleware = (middlewareAPI) => {
  let middleware = next => action => next(action)

  return next => (action) => {
    if (action.type === PLUGINS_LOADED) {
      middleware = getMiddleware(action.payload.cache)(middlewareAPI)
    }

    return middleware(next)(action)
  }
}

export default middlewareManagerMiddleware
