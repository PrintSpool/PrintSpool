import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import isMacroEnabled from '../../config/selectors/isMacroEnabled'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { SET_TOOLHEAD_MATERIALS } from '../../config/actions/setToolheadMaterials'
import { DESPOOL_TASK } from '../../spool/actions/despoolTask'

import spoolMacroExpansion from '../../spool/actions/spoolMacroExpansion'
import despoolCompleted from '../../spool/actions/despoolCompleted'
import driverError from '../../printer/actions/driverError'

export const initialState = Record({
  config: null,
  enabled: false,
})()

const createMacroExpansionReducer = (
  meta,
  macroFn,
) => (state = initialState, action) => {
  switch (action.type) {
    case SET_TOOLHEAD_MATERIALS:
    case SET_CONFIG: {
      const { config } = action.payload
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
        let data
        try {
          data = macroFn(args, state)
        } catch (e) {
          return loop(state, Cmd.action(driverError({
            code: e.code || 'INVALID_MACRO',
            message: e.message,
            stack: e.stack,
          })))
        }

        /*
         * 1. insert the expanded gcode lines in a task before everything else
         * effectively swapping the host macro for the expanded gcode lines
         * 2. despool the first line of that expanded gcode
         */
        const actions = [
          Cmd.action(spoolMacroExpansion({ action, data })),
          Cmd.action(despoolCompleted({ task })),
        ]

        return loop(state, Cmd.list(actions))
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default createMacroExpansionReducer
