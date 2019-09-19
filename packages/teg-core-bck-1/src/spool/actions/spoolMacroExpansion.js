import { PREEMPTIVE } from '../types/PriorityEnum'
import spoolTask from './spoolTask'

const spoolMacroExpansion = ({ action, data }) => {
  const expansionTaskAttrs = {
    name: '[MACRO_EXPANSION]',
    internal: action.payload.task.internal,
    priority: PREEMPTIVE,
    data,
  }
  return spoolTask(expansionTaskAttrs, { prepend: true })
}

export default spoolMacroExpansion
