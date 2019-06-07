import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  estop,
  connectPrinter,
  despoolCompleted,
  DESPOOL_TASK,
  DRIVER_ERROR,
  ESTOP,
  PRINTER_DISCONNECTED,
  PRINTER_READY,
} from '@tegh/core'

export const initialState = Record({
  estopping: false,
  resetting: false,
  ready: false,
})()

const estopAndResetReducer = (state = initialState, action) => {
  switch (action.type) {
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      return state.set('ready', false)
    }
    case PRINTER_READY: {
      return initialState
        .set('estopping', false)
        .set('ready', true)
    }
    case DESPOOL_TASK: {
      const { macro, task } = action.payload

      if (macro === 'eStop') {
        if (state.estopping) return state

        const nextState = state.set('estopping', true)

        return loop(nextState, Cmd.list([
          Cmd.action(despoolCompleted({ task })),
          Cmd.action(estop()),
        ]))
      }

      if (macro === 'reset') {
        if (state.resetting || state.ready) return state

        const nextState = state.set('resetting', true)

        return loop(nextState, Cmd.list([
          Cmd.action(despoolCompleted({ task })),
          Cmd.action(connectPrinter()),
        ]))
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default estopAndResetReducer
