import { SPOOL_TASK } from 'tegh-server'

import { throwErrorOnInvalidGCode } from './txParser.js'

const initializeCollection = (arrayOfIDs, initialValueFn) => {
  return arrayOfIDs.reduce(
    (collection, id) => {
      collection[id] = initialValueFn(id)
      return collection
    },
    {}
  )
}

const initialState = (config) => ({
  targetTemperaturesCountdown: null,
  heaters: initializeCollection(config.heaters, (id) => ({
    id,
    currentTemperature: 0,
    targetTemperature: null,
    blocking: false,
  })),
  fans: initializeCollection(config.fans, (id) => ({
    id,
    enabled: false,
    speed: 0,
  })),
  // 'errored', 'estopped', 'disconnected', 'connecting', 'ready'
  status: 'disconnected',
  error: null,
  currentLineNumber: 1,
  ignoreOK: false,
})

const serialGCodeReducer = ({ config }) => (
  state = initialState(config),
  action
) => {
  switch(action.type) {
    case 'DRIVER_ERROR':
      return {
        ...initialState(config),
        status: 'errored',
        error: action.error,
      }
    case 'ESTOP':
      return {
        ...initialState(config),
        status: 'estopped',
      }
    case 'SERIAL_CLOSE':
      return {
        ...initialState(config),
        status: 'disconnected',
      }
    case 'SERIAL_OPEN':
      return {
        ...initialState(config),
        status: 'connecting',
      }
    case 'PRINTER_READY':
      return {
        ...initialState(config),
        status: 'ready',
      }
    case 'SERIAL_RECEIVE': {
      if (action.data.type === 'greeting') {
        return {
          ...initialState(config),
          status: 'connecting',
        }
      }
      if (action.data.type === 'resend') {
        return {
          ...state,
          ignoreOK: 'next',
        }
      }
      if (action.data.type === 'ok' && state.ignoreOK === 'next') {
        return {
          ...state,
          ignoreOK: 'current',
        }
      }
      const nextState = {
        ...state,
        ignoreOK: false,
      }
      if (action.data.temperatures != null) {
        const heaters = {...state.heaters}
        Object.entries(action.data.temperatures).forEach(([k, v]) => {
          heaters[k] = {...heaters[k], currentTemperature: v}
        })
        const {targetTemperaturesCountdown} = action.data
        return {
          ...nextState,
          targetTemperaturesCountdown,
          heaters,
        }
      }
      return nextState
    }
    case SPOOL_TASK:
      if (
        state.status !== 'ready' &&
        action.payload.task.priority !== EMERGENCY
      ) {
        throw new Error(
          'Only emergency tasks can be spooled when the machine is not ready.'
        )
      }
      throwErrorOnInvalidGCode(action.payload.task.data)
      return state
    case 'SERIAL_SEND':
      const {lineNumber, collectionKey, id, changes} = action
      const nextState = {
        ...state,
      }
      if (typeof lineNumber === 'number') {
        nextState.currentLineNumber = lineNumber + 1
      }
      if (collectionKey == null) return nextState
      // update the heater or fan's state.
      return {
        ...nextState,
        [collectionKey]: {
          ...state[collectionKey],
          [id]: {
            ...state[collectionKey][id],
            ...changes,
          },
        },
      }
    default:
      return state
  }
}

export default serialGCodeReducer
