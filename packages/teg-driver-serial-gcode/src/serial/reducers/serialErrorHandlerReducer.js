import { loop, Cmd } from 'redux-loop'
import { driverError } from '@tegapp/core'

import { SERIAL_ERROR } from '../actions/serialError'

const serialDriverError = error => (
  driverError({
    code: 'teg/serial/SERIAL_ERROR',
    message: error.message,
  })
)

const serialErrorHandlerReducer = (state, action) => {
  switch (action) {
    case SERIAL_ERROR: {
      return loop(state, Cmd.action(serialDriverError()))
    }
    default: {
      return state
    }
  }
}

export default serialErrorHandlerReducer
