import getHeaterConfigs from '../../config/selectors/getHeaterConfigs'

const HeaterResolvers = {
  Heater: {
    name: (source, args, { store }) => {
      const state = store.getState()
      return getHeaterConfigs(state.config).getIn([source.id, 'model', 'name'])
    },
    type: (source, args, { store }) => {
      const state = store.getState()
      return getHeaterConfigs(state.config).getIn([source.id, 'type'])
    },
  },
}

export default HeaterResolvers
