import spoolTask from './spoolTask'
import { NORMAL } from '../types/PriorityEnum'

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
  const { config } = state

  const macroPlugin = config.macroPluginsByMacroName[macro]

  if (macroPlugin == null) {
    throw new Error(`Macro ${macro} does not exist`)
  }

  const runMacro = import(config.pluginLoaderPath)(macroPlugin)[macro]

  const gcodeLines = runMacro(args, state.config)

  const action = spoolTask({
    name: macro,
    internal,
    priority: priority || runMacro.priority || NORMAL,
    data: gcodeLines,
  })

  return dispatch(action)
}

export default spoolMacro
