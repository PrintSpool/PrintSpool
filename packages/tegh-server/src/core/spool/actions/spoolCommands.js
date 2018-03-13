import spoolTask from './spoolTask'
import validateCommandsFileExtension from '../../util/validateCommandsFileExtension'

/*
 * creates a new Task from the file and spools it.

 * internal?: Boolean [default: false]
 * priority?: TaskPriority [default: macro.priority || 'normal'],
 * file?: { name: String, content: String }
 */
const spoolCommands = ({ internal = false, priority, file }) => {
  if (file == null) {
    throw new Error('file cannot be null')
  }

  const { name, content } = file

  if (name == null) {
    throw new Error('file name cannot be null')
  }
  if (content == null) {
    throw new Error('content cannot be null')
  }

  validateCommandsFileExtension(name)

  return spoolTask({
    name,
    internal,
    priority: priority || 'normal',
    data: [content],
  })
}

export default spoolCommands
