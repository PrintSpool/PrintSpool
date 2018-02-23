/*
 * One of `id`, `file` or `macro` MUST be not null:
 *
 * If `id` is not null then `spoolTask` spools the task with the given id.
 *
 * If `file` is not null then `spoolTask` creates a new Task from the file and
 * spools it.
 *
 * If `macro` is not null then `spoolTask` spools the macro with the given args
 *
 * internal?: Boolean [default: false]
 * priority?: TaskPriority [default: macro.priority || 'normal'],
 * file?: { name: String, content: String }
 * macro?: { name: String, args: JSON }
 */
const spoolTask = ({ internal, priority, file, macro }) => {
  return (dispatch, getState) => {
    const variaticArgs = [id, file, macro]
    const nullArgCount = variaticArgs.filter(arg => arg == null).length
    if (nullArgCount === variaticArgs.length) {
      throw new Error('id, file and macro cannot all be null')
    }
    if (variaticArgs.length - nullArgCount > 1 ) {
      throw new Error('only one of id, file or macro should be set')
    }

    let createTaskMicroAction, payload

    if (macro != null) {
      const state = getState()
      const macroDefinition = state.macros[args.macro]
      if (macroDefinition == null) {
        throw new Error(`Macro ${macro.name} does not exist`)
      }
      const gcode = macroDefinition.run(macro.args, state.config)
      // TODO: move to a reducer
      // if (state.driver.status !== 'ready' && priority !== 'emergency') {
      //   throw new Error('Machine is not ready')
      // }
      createTaskMicroAction = createTask({
        name: macroDefinition.name,
        internal,
        priority: priority || macroDefinition.priority,
        data: gcode,
      })
    }
    if(file != null) {
      const { name, content } = file

      createTaskMicroAction = createTask({
        internal,
        priority,
        name,
        data: [content],
      })
    }

    payload = {
      id: createTaskMicroAction.payload.task.id,
      createTaskMicroAction,
    }

    return dispatch({
      type: SPOOL_TASK,
      payload,
    })
  }
}

export spoolTask
