import spoolTask from './spoolTask'
import { NORMAL } from '../types/PriorityEnum'
import runMacro from '../../config/selectors/runMacro'
import getMacroRunFn from '../../pluginManager/selectors/getMacroRunFn'

/*
 * spools the macro with the given args
 *
 * internal?: Boolean [default: false]
 * priority?: TaskPriority [default: macro.priority || NORMAL],
 * macro: String
 * args?: JSON [default: null]
 */
const spoolMacro = ({
  internal = false,
  priority,
  macro,
  args,
}) => (
  dispatch,
  getState,
) => {
  if (macro == null) {
    throw new Error('macro must not be null')
  }

  const state = getState()

  const gcodeLines = runMacro(state)(macro, args)

  const action = spoolTask({
    name: macro,
    internal,
    priority: priority || getMacroRunFn(state)(macro).priority || NORMAL,
    data: gcodeLines,
  })

  return dispatch(action)
}

export default spoolMacro
