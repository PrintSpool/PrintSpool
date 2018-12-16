import { loop, Cmd } from 'redux-loop'

import {
  estop,
  connectPrinter,
  DESPOOL_TASK,
} from 'tegh-core'

export const initialState = null

const estopAndResetReducer = (state = initialState, action) => {
  switch (action.type) {
    case DESPOOL_TASK: {
      const { macro } = action.payload

      if (macro === 'eStop') {
        return loop(state, Cmd.action(estop()))
      }

      if (macro === 'reset') {
        return loop(state, Cmd.action(connectPrinter()))
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default estopAndResetReducer
