// // TODO: load initial state from config
// const initialState = {
//   targetTemperaturesCountdown: null
//   heaters: {
//
//   },
//   axes: {
//
//   }
//   id: undefined,
//   ready: false,
//   error: null,
// }


const GREETINGS = /^(start|grbl |ok|.*t:)/
const DELAY_FROM_GREETING_TO_READY = 2500

const serialGCodeReducer = (state = initialState, action) => {
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
          ...state
          ready: false,
          error: action.data
        }
      }
      return state
    case 'SERIAL_SEND':
      return state // TODO: update state
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
