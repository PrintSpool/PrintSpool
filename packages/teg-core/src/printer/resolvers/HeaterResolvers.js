import getComponentsState from '../selectors/getComponentsState'
import getHeaterMaterialTargets from '../selectors/getHeaterMaterialTargets'

const HeaterResolvers = {
  Heater: {
    history: (source, args, { store }) => {
      // TODO: heater history
      return []
      // const state = store.getState()
      // return getComponentsState(state).temperatureHistory
      //   .filter(entry => entry.componentID === source.id)
      //   .toArray()
    },
    materialTarget: (source, args, { store }) => {
      const { config } = store.getState()
      const machineConfig = config.machines.get(source.machineID)
      const configPair = { machineConfig, combinatorConfig: config }

      return getHeaterMaterialTargets(configPair).get(source.id)
    },
  },
}

export default HeaterResolvers
