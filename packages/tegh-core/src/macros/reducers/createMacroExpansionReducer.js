import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import { PREEMPTIVE } from '../../spool/types/PriorityEnum'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { DESPOOL_TASK } from '../../spool/actions/despoolTask'

import prependTask from '../../spool/actions/prependTask'
import requestDespool from '../../spool/actions/requestDespool'

const initialState = Record({
  config: null,
})()

const createMacroExpansionReducer = (
  macroName,
  macroFn,
) => (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      return state.set('config', state.payload.config)
    }
    case DESPOOL_TASK: {
      const { macro, args, task } = action.payload

      if (macro === macroName) {
        // expand the macro into it's expanded gcode (an array of strings)
        const data = macroFn(args, state)
        /*
         * 1. insert the expanded gcode lines in a task before everything else
         * effectively swapping the host macro for the expanded gcode lines
         * 2. despool the first line of that expanded gcode
         */
        const actions = [
          Cmd.action(prependTask({
            name: 'test.ngc',
            internal: task.internal,
            priority: PREEMPTIVE,
            data,
          })),
          Cmd.action(requestDespool()),
        ]

        loop(state, Cmd.list(actions))
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default createMacroExpansionReducer
