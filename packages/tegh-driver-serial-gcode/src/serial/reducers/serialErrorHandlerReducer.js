import { SERIAL_ERROR } from '../actions/serialError'

const serialErrorHandlerSaga = (state, action) => {
  switch (action) {
    case SERIAL_ERROR: {
      // Re-throw serial port errors as uncaught exceptions so that they crash
      // the process. Continuing after a serial error leads to an unknown state.
      throw action.error
    }
    default: {
      return state
    }
  }
}

export default serialErrorHandlerSaga
