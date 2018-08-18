import { compose } from 'redux'
import { createSelector } from 'reselect'

const getMiddleware = createSelector(plugins => (middlewareAPI) => {
  const chain = plugins
    .values()
    .filter(({ middleware }) => middleware != null)
    .map(({ middleware }) => middleware(middlewareAPI))

  return compose(...chain.toArray())
})

export default getMiddleware
