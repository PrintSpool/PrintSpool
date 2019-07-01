import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  despoolCompleted,
  SET_CONFIG,
  DESPOOL_TASK,
  isMacroEnabled,
} from '@tegapp/core'

const meta = {
  package: '@tegapp/macros-default',
  macro: 'noOp',
}

export const initialState = Record({
  enabled: false,
})()

// example useage: noOp
const noOp = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const enabled = isMacroEnabled({ config, meta })

      return state.merge({
        enabled,
      })
    }
    case DESPOOL_TASK: {
      const { macro, task } = action.payload

      if (macro !== meta.macro || !state.enabled) {
        return state
      }

      return loop(
        state,
        Cmd.list([
          Cmd.action(despoolCompleted({ task })),
        ]),
      )
    }
    default: {
      return state
    }
  }
}

export default noOp
