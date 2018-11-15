const getComponentsState = (state) => {
  if (state.config == null) return null
  return state.get('tegh-driver-serial-gcode').components
}

export default getComponentsState
