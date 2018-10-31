const getDriverState = (state) => {
  if (state.config == null) return null
  return state.get(state.config.machine.driver)
}

export default getDriverState
