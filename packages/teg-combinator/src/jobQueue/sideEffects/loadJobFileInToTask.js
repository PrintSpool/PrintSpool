import Promise from 'bluebird'
import fs from 'fs'

import { NORMAL } from '../../spool/types/PriorityEnum'

const readFileAsync = Promise.promisify(fs.readFile)

const loadJobFileInToTask = async ({ jobFile }) => {
  const fileContent = await readFileAsync(jobFile.filePath, 'utf8')

  return {
    internal: false,
    priority: NORMAL,
    jobID: jobFile.jobID,
    jobFileID: jobFile.id,
    name: jobFile.name,
    data: [fileContent],
  }
}

export default loadJobFileInToTask
