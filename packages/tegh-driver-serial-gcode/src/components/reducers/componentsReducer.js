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
  /*
   * the components' non-configuration/dynamic/ephemeral data (eg.
   * currentTemperature) indexed by their ID
   */
  byAddress: Map(),
})()

export const Heater = Record({
  heater: true,
  id: null,
  type: null,
  address: null,
  currentTemperature: 0,
  targetTemperature: null,
  blocking: false,
})

export const Fan = Record({
  id: null,
  type: null,
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

      const heaters = heaterConfigs.mapEntries(([id, component]) => {
        const address = component.model.get('address')
        return [
          address,
          Heater({
            id,
            address,
            type: component.type,
          }),
        ]
      })

      const fans = fanConfigs.mapEntries(([id, component]) => {
        const address = component.model.get('address')
        return [
          address,
          Fan({
            id,
            address,
            type: component.type,
          }),
        ]
      })

      const dynamicComponents = heaters.merge(fans)

      return initialState.set('byAddress', dynamicComponents)
    }
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      /*
       * reset all the dynamic attributes of each component
       */
      return initialState.set('byAddress', state.byAddress.map((ephemeralComponent) => {
        const {
          id,
          type,
          address,
        } = ephemeralComponent
        const perminentAttrs = { id, type, address }

        if (ephemeralComponent.type === FAN) {
          return Fan(perminentAttrs)
        }
        if (ephemeralComponent.heater === true) {
          return Heater(perminentAttrs)
        }
        return ephemeralComponent
      }))
    }
    case SERIAL_RECEIVE: {
      const {
        temperatures,
        targetTemperaturesCountdown,
      } = action.payload

      let nextState = state

      if (temperatures != null) {
        Object.entries(temperatures).forEach(([k, v]) => {
          if (state.byAddress.get(k) == null) return
          nextState = nextState.setIn(['byAddress', k, 'currentTemperature'], v)
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
        nextState = nextState.mergeIn(['byAddress', id], changes)
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
