import { loop, Cmd } from 'redux-loop'
import { Map } from 'immutable'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { SPOOL_MACRO } from '../../spool/actions/spoolMacro'
import spoolTask from '../../spool/actions/spoolTask'

import { NORMAL } from '../../spool/types/PriorityEnum'

import getMacroRunFnsByName from '../../pluginManager/selectors/getMacroRunFnsByName'

export const initialState = Map()

const macrosReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const nextState = getMacroRunFnsByName(action.payload)

      return nextState
    }
    case SPOOL_MACRO: {
      const {
        internal,
        priority,
        macro,
        args,
      } = action.payload

      const macroRunFn = state.get(macro)

      if (macroRunFn == null) {
        throw new Error(`Macro ${macro} does not exist`)
      }

      return loop(state, Cmd.action(
        spoolTask({
          name: macro,
          internal,
          priority: priority || macroRunFn.priority || NORMAL,
          data: macroRunFn(args),
        }),
      ))
    }
    default: {
      return state
    }
  }
}

export default macrosReducer
