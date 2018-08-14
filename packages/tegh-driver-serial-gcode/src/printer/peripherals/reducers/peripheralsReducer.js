import { Record } from 'immutable'

import {
  ESTOP,
  DRIVER_ERROR,
  PRINTER_READY,
} from 'tegh-server'

const initializeCollection = (arrayOfIDs, initialValueFn) => (
  arrayOfIDs.reduce(
    (map, id) => map.set(id, initialValueFn(id)),
    Map(),
  )
)

const createState = config => (
  Record({
    targetTemperaturesCountdown: null,
    heaters: initializeCollection(config.heaters, id => Record({
      id,
      currentTemperature: 0,
      targetTemperature: null,
      blocking: false,
    })()),
    fans: initializeCollection(config.fans, id => Record({
      id,
      enabled: false,
      speed: 0,
    })()),
  })()
)

const peripheralsReducer = (state, action) => {
  switch(action.type) {
    case SET_CONFIG:
    case DRIVER_ERROR:
    case ESTOP:
    case SERIAL_OPEN:
    case PRINTER_READY:
    case ESTOP:
    case SERIAL_CLOSE: {
      return createState(action.config)
    }
    case SERIAL_RECEIVE: {
      let nextState = state

      if (action.data.temperatures != null) {
        Object.entries(action.data.temperatures).forEach(([k, v]) => {
          nextState = nextState.setIn(['heaters', k, 'currentTemperature'], v)
        })

        nextState = nextState.set(
          'targetTemperaturesCountdown',
          action.data.targetTemperaturesCountdown
        )
      }

      return nextState
    }
    case SERIAL_SEND: {
      const { collectionKey, id, changes } = action
      if (collectionKey == null) return state
      // update the heater or fan's state.
      return state.mergeIn([collectionKey, id], changes)
    }
    default: {
      return state
    }
  }
}

export default peripheralsReducer
