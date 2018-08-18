import { LOAD_PLUGINS } from '../actions/loadPlugins'
import getMiddleware from '../selectors/getMiddleware'

const middlewareManagerMiddleware = (middlewareAPI) => {
  let middleware = next => action => next(action)

  return next => (action) => {
    if (action.type === LOAD_PLUGINS) {
      middleware = getMiddleware(action.payload.cache)(middlewareAPI)
    }

    return middleware(next)(action)
  }
}

export default middlewareManagerMiddleware
