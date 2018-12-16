import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import isMacroEnabled from '../../config/selectors/isMacroEnabled'
import { PREEMPTIVE } from '../../spool/types/PriorityEnum'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { DESPOOL_TASK } from '../../spool/actions/despoolTask'

import spoolTask from '../../spool/actions/spoolTask'
import requestDespool from '../../spool/actions/requestDespool'

const initialState = Record({
  config: null,
  enabled: false,
})()

const createMacroExpansionReducer = (
  meta,
  macroFn,
) => (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = state.payload
      const enabled = isMacroEnabled({ config, meta })

      return state.merge({
        config,
        enabled,
      })
    }
    case DESPOOL_TASK: {
      const { macro, args, task } = action.payload

      if (macro === meta.macro && state.enabled) {
        // expand the macro into it's expanded gcode (an array of strings)
        const data = macroFn(args, state)
        /*
         * 1. insert the expanded gcode lines in a task before everything else
         * effectively swapping the host macro for the expanded gcode lines
         * 2. despool the first line of that expanded gcode
         */
        const taskAttrs = {
          name: 'test.ngc',
          internal: task.internal,
          priority: PREEMPTIVE,
          data,
        }
        const actions = [
          Cmd.action(spoolTask(taskAttrs, { prepend: true })),
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
