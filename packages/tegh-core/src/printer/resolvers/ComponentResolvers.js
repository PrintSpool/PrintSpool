import getComponentsState from '../selectors/getComponentsState'
import { FAN } from '../../config/types/components/ComponentTypeEnum'

const ComponentResolvers = {
  Component: {
    name: source => (
      source.model.get('name')
    ),
    address: source => (
      source.model.get('address')
    ),
    heater: (source, args, { store }) => {
      const heater = source.getIn(['model', 'heater'])

      if (heater) {
        const state = store.getState()
        const address = source.model.get('address')
        const dynamicComponent = getComponentsState(state).byAddress.get(address)
        return dynamicComponent
      }

      return null
    },
    fan: (source, args, { store }) => {
      if (source.type === FAN) {
        const state = store.getState()
        const address = source.model.get('address')
        const dynamicComponent = getComponentsState(state).byAddress.get(address)
        return dynamicComponent
      }

      return null
    },
  },
}

export default ComponentResolvers
