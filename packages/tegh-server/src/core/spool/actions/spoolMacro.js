import spoolTask from './spoolTask'

/*
 * spools the macro with the given args
 *
 * internal?: Boolean [default: false]
 * priority?: TaskPriority [default: macro.priority || NORMAL],
 * macro: String
 * args?: JSON [default: null]
 */
const spoolMacro = ({ internal = false, priority, macro, args }) => {
  return (dispatch, getState) => {
    if (macro == null) {
      throw new Error('macro must not be null')
    }

    const state = getState()
    const macroDefinition = state.macros[macro]

    if (macroDefinition == null) {
      throw new Error(`Macro ${macro} does not exist`)
    }

    const gcodeLines = macroDefinition.run(args, state.config)

    const action = spoolTask({
      name: macroDefinition.name,
      internal,
      priority: priority || macroDefinition.priority || NORMAL,
      data: gcodeLines,
    })

    return dispatch(action)
  }
}

export default spoolMacro
