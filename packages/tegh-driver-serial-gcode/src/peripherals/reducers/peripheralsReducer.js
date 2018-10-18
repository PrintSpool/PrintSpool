import { Record, Map } from 'immutable'

import {
  ESTOP,
  DRIVER_ERROR,
  PRINTER_DISCONNECTED,
  SET_CONFIG,
  getHeaterConfigs,
  getFanConfigs,
} from 'tegh-core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import { SERIAL_SEND } from '../../serial/actions/serialSend'

export const initialState = Record({
  targetTemperaturesCountdown: null,
  activeExtruderID: 'e0',
  heaters: Map(),
  fans: Map(),
})()

export const Heater = Record({
  id: null,
  currentTemperature: 0,
  targetTemperature: null,
  blocking: false,
})

export const Fan = Record({
  id: null,
  enabled: false,
  speed: 0,
})

const initializeCollection = (peripheralConfigs, initialValueFn) => (
  peripheralConfigs.map(({ id }) => initialValueFn(id))
)

const peripheralsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      return initialState.merge({
        heaters: initializeCollection(getHeaterConfigs(config), id => (
          Heater({ id })
        )),
        fans: initializeCollection(getFanConfigs(config), id => (
          Fan({ id })
        )),
      })
    }
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      return initialState.merge({
        heaters: state.heaters.map(({ id }) => Heater({ id })),
        fans: state.fans.map(({ id }) => Fan({ id })),
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
        id,
        changes,
        activeExtruderID,
      } = action.payload

      let nextState = state

      // update the heater or fan's state.
      if (collectionKey != null) {
        nextState = nextState.mergeIn([collectionKey, id], changes)
      }

      if (activeExtruderID != null) {
        nextState = nextState.set('activeExtruderID', activeExtruderID)
      }

      return nextState
    }
    default: {
      return state
    }
  }
}

export default peripheralsReducer
