import Promise from 'bluebird'

import fs from 'fs'

const readFileAsync = Promise.promisify(fs.readFile)

const loadTaskFile = async (task) => {
  const content = await readFileAsync(task.filePath, 'utf8')

  return task.set('commands', content.split('\n'))
}

export default loadTaskFile
