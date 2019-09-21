import getComponentsState from '../selectors/getComponentsState'
import getHeaterMaterialTargets from '../selectors/getHeaterMaterialTargets'

const HeaterResolvers = {
  Heater: {
    history: (source, args, { store }) => {
      // TODO: heater history
      // const state = store.getState()
      // return getComponentsState(state).temperatureHistory
      //   .filter(entry => entry.componentID === source.id)
      //   .toArray()
    },
    materialTarget: (source, args, { store }) => {
      // TODO: config-based values
      // const { config } = store.getState()

      // return getHeaterMaterialTargets(config).get(source.id)
    },
  },
}

export default HeaterResolvers
