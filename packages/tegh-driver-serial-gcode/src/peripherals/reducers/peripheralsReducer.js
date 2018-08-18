import { Record } from 'immutable'

import {
  ESTOP,
  DRIVER_ERROR,
  PRINTER_READY,
  SET_CONFIG,
  getHeaterConfigs,
  getFanConfigs,
} from 'tegh-server'

import { SERIAL_OPEN } from '../../serial/actions/serialOpen'
import { SERIAL_CLOSE } from '../../serial/actions/serialClose'
import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import { SERIAL_SEND } from '../../serial/actions/serialSend'

const initializeCollection = (arrayOfIDs, initialValueFn) => (
  arrayOfIDs.reduce(
    (map, id) => map.set(id, initialValueFn(id)),
    Map(),
  )
)

const createStateFromConfig = config => (
  Record({
    targetTemperaturesCountdown: null,
    activeExtruderID: 'e0',
    heaters: initializeCollection(getHeaterConfigs(config), id => Record({
      id,
      currentTemperature: 0,
      targetTemperature: null,
      blocking: false,
    })()),
    fans: initializeCollection(getFanConfigs(config), id => Record({
      id,
      enabled: false,
      speed: 0,
    })()),
  })()
)

const peripheralsReducer = (state = null, action) => {
  switch (action.type) {
    case SET_CONFIG:
    case DRIVER_ERROR:
    case ESTOP:
    case SERIAL_OPEN:
    case PRINTER_READY:
    case SERIAL_CLOSE: {
      return createStateFromConfig(action.config)
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
