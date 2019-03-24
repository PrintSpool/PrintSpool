const getAxePositions = (state) => {
  if (state.config == null) return null
  const history = state.getIn([state.driver, 'components', 'movementHistory'])
  return history.last().position
}

export default getAxePositions
