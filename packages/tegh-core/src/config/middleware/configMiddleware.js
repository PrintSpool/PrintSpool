const configMiddleware = store => next => (action) => {
  const { config } = store.getState()

  return next({
    ...action,
    config,
  })
}

export default configMiddleware
