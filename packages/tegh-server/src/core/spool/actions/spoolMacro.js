import spoolTask from './spoolTask'

/*
 * spools the macro with the given args
 *
 * internal?: Boolean [default: false]
 * priority?: TaskPriority [default: macro.priority || 'normal'],
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

    const gcode = macroDefinition.run(args, state.config)

    // TODO: move to a reducer
    // if (state.driver.status !== 'ready' && priority !== 'emergency') {
    //   throw new Error('Machine is not ready')
    // }

    const action = spoolTask({
      name: macroDefinition.name,
      internal,
      priority: priority || macroDefinition.priority || 'normal',
      data: gcode,
    })

    return dispatch(action)
  }
}

export default spoolMacro
