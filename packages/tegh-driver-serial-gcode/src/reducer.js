const initializeCollection = (arrayOfIDs, initialValueFn) => {
  return arrayOfIDs.reduce(
    ((collection, id) => collection[id] = initialValueFn()),
    {}
  )
}

const initialState = (config) => ({
  targetTemperaturesCountdown: null,
  heaters: initializeCollection(config.heaters, () => ({
    currentTemperature: 0,
    targetTemperature: 0,
    blocking: false,
  })),
  fans: initializeCollection(config.fans, () => ({
    enabled: false,
    speed: 0,
  })),
  ready: false,
  error: null,
  previousLineNumber: -1,
})

const serialGCodeReducer = (config) => (
  state = initialState(config),
  action
) => {
  switch(action.type) {
    case 'SERIAL_RECEIVE':
      if (action.parsedData.temperatures != null) {
        const heaters = {...heaters}
        action.parsedData.temperatures.forEach((k, v) => {
          heaters[k] = {...heaters[k], currentTemperature: v}
        })
        const {targetTemperaturesCountdown} = action.parsedData
        return {
          ...state,
          targetTemperaturesCountdown,
          heaters,
        }
      }
      if (action.parsedData.isError) {
        return {
          ...state,
          ready: false,
          error: action.data,
        }
      }
      return state
    case 'SERIAL_SEND':
      const {parsedData} = action
      const {type} = parsedData
      if (type == null) return state
      const collectionID = {
        'HEATER_CONTROL': 'heaters',
        'FAN_CONTROL': 'fans',
      }[type]
      if (collectionID == null) throw new Error(`Invalid type: ${type}`)
      // update the heater or fan's state.
      return {
        ...state,
        [collectionID]: {
          ...state[collectionID],
          [parsedData.id]: {
            ...state[collectionID][parsedData.id],
            ..._.without(parsedData, ['id', 'type']),
          },
        },
      }
    case 'PRINTER_READY':
      return {
        ...state,
        ready: true,
      }
    default:
      return state
  }
}

export default serialGCodeReducer
