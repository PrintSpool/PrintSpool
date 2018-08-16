const getDriverState = (state) => {
  if (state.config == null) return null
  return state.get(state.config.driver.package)
}

export default getDriverState
