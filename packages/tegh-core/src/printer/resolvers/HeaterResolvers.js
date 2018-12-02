import getHeaterConfigs from '../../config/selectors/getHeaterConfigs'

const HeaterResolvers = {
  Heater: {
    name: (source, args, { store }) => {
      const state = store.getState()
      return getHeaterConfigs(state.config).get(source.id).name
    },
    type: (source, args, { store }) => {
      const state = store.getState()
      return getHeaterConfigs(state.config).get(source.id).type
    },
  },
}

export default HeaterResolvers
