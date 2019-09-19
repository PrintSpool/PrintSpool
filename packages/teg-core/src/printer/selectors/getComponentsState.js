const getComponentsState = (state) => {
  if (state.config == null) return null
  return state.getIn([state.driver, 'components'])
}

export default getComponentsState
