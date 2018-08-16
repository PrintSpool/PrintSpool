import spoolTask from './spoolTask'
import { NORMAL } from '../types/PriorityEnum'
import runMacro from '../../config/selectors/runMacro'

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

  const gcodeLines = runMacro(config)(macro, args, config)

  const action = spoolTask({
    name: macro,
    internal,
    priority: priority || runMacro.priority || NORMAL,
    data: gcodeLines,
  })

  return dispatch(action)
}

export default spoolMacro
