import getComponentsState from '../selectors/getComponentsState'

const HeaterResolvers = {
  Heater: {
    history: (source, args, { store }) => {
      const state = store.getState()
      return getComponentsState(state).temperatureHistory
        .filter(entry => entry.componentID === source.id)
        .toArray()
    },
  },
}

export default HeaterResolvers
