import { throwErrorOnInvalidGCode } from './tx_parser.js'

const VERBOSE = true

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
  ready: false,
  error: null,
  currentLineNumber: 1,
})

const serialGCodeReducer = ({ config }) => (
  state = initialState(config),
  action
) => {
  switch(action.type) {
    case 'SERIAL_TIMEOUT':
      return {
        ...state,
        ready: false,
        error: {
          code: 'SERIAL_TIMEOUT',
          message: 'Serial timeout',
        }
      }
    case 'SERIAL_RECEIVE':
      if (action.data.temperatures != null) {
        const heaters = {...state.heaters}
        Object.entries(action.data.temperatures).forEach(([k, v]) => {
          heaters[k] = {...heaters[k], currentTemperature: v}
        })
        const {targetTemperaturesCountdown} = action.data
        return {
          ...state,
          targetTemperaturesCountdown,
          heaters,
        }
      }
      if (action.data.type === 'error') {
        return {
          ...state,
          ready: false,
          error: {
            code: 'FIRMWARE_ERROR',
            message: action.data,
          },
        }
      }
      return state
    case 'SPOOL':
      throwErrorOnInvalidGCode(action.task.data)
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
    case 'PRINTER_READY':
      return {
        ...state,
        ready: true,
        currentLineNumber: 1,
      }
    default:
      return state
  }
}

export default serialGCodeReducer
