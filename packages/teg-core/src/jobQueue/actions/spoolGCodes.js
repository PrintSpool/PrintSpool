import spoolTask from './spoolTask'
import validateCommandsFileExtension from '../../util/validateCommandsFileExtension'

/*
 * creates a new Task from the file and spools it.
 * file?: { name: String, content: String }
 */
const spoolGCodes = ({ file }) => {
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
    data: [content],
    totalLines: content.split('\n').length,
  })
}

export default spoolGCodes
