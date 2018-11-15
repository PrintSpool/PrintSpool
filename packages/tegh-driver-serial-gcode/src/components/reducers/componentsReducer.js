import { Record, Map } from 'immutable'

import {
  ESTOP,
  DRIVER_ERROR,
  PRINTER_DISCONNECTED,
  SET_CONFIG,
  ComponentTypeEnum,
  getHeaterConfigs,
  getComponentsByType,
} from 'tegh-core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import { SERIAL_SEND } from '../../serial/actions/serialSend'

const { FAN } = ComponentTypeEnum

export const initialState = Record({
  targetTemperaturesCountdown: null,
  activeExtruderAddress: 'e0',
  heaters: Map(),
  fans: Map(),
})()

export const Heater = Record({
  id: null,
  address: null,
  currentTemperature: 0,
  targetTemperature: null,
  blocking: false,
})

export const Fan = Record({
  id: null,
  address: null,
  enabled: false,
  speed: 0,
})

const componentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      const heaterConfigs = getHeaterConfigs(config)
      const fanConfigs = getComponentsByType(config).get(FAN, Map())

      return initialState.merge({
        heaters: heaterConfigs
          .mapKeys((id, { address }) => address)
          .map(({ id, address }) => Heater({ id, address })),
        fans: fanConfigs
          .mapKeys((id, { address }) => address)
          .map(({ id, address }) => Fan({ id, address })),
      })
    }
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      return initialState.merge({
        heaters: state.heaters
          .map(({ id, address }) => Heater({ id, address })),
        fans: state.fans
          .map(({ id, address }) => Fan({ id, address })),
      })
    }
    case SERIAL_RECEIVE: {
      const {
        temperatures,
        targetTemperaturesCountdown,
      } = action.payload

      let nextState = state

      if (temperatures != null) {
        Object.entries(temperatures).forEach(([k, v]) => {
          if (state.heaters.get(k) == null) return
          nextState = nextState.setIn(['heaters', k, 'currentTemperature'], v)
        })
      }

      if (targetTemperaturesCountdown != null) {
        // TODO: targetTemperaturesCountdown does not get reset anywhere
        // after a target temperature is reached
        nextState = nextState.set(
          'targetTemperaturesCountdown', targetTemperaturesCountdown,
        )
      }

      return nextState
    }
    case SERIAL_SEND: {
      const {
        collectionKey,
        // Legacy: This is actually the address of the component not it's id
        id,
        changes,
        activeExtruderAddress,
      } = action.payload

      let nextState = state

      // update the heater or fan's state.
      if (collectionKey != null) {
        nextState = nextState.mergeIn([collectionKey, id], changes)
      }

      if (activeExtruderAddress != null) {
        nextState = nextState
          .set('activeExtruderAddress', activeExtruderAddress)
      }

      return nextState
    }
    default: {
      return state
    }
  }
}

export default componentsReducer
