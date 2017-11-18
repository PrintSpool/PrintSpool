const initialState = {
  config: {
    path: undefined,
    baudRate: undefined,
  },
  id: undefined,
  ready: false,
  _readyTimeoutID: null,
  _temperatureLastUpdated: null,
}


const GREETINGS = /^(start|grbl |ok|.*t:)/
const DELAY_FROM_GREETING_TO_READY = 2500

const teghDriverSerialGCodeReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'SERIAL_RECEIVE':

      return state
    case 'SERIAL_ERROR':
      return state
    case 'PRINTER_READY':
      return {
        ...state,
        ready: true,
      }
    default:
      return state
  }
}

export default teghDriverSerialGCodeReducer
