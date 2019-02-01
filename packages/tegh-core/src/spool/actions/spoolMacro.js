import spoolTask from './spoolTask'
import { NORMAL, EMERGENCY } from '../types/PriorityEnum'

const emergencyTasks = [
  'eStop',
  'reset',
]

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
}) => {
  if (macro == null) {
    throw new Error('macro must not be null')
  }

  return spoolTask({
    name: macro,
    internal,
    priority: priority || emergencyTasks.includes(macro) ? EMERGENCY : NORMAL,
    data: [`${macro} ${JSON.stringify(args)}`],
  })
}

export default spoolMacro
