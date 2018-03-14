import fs from '../../util/promisifiedFS'

import { NORMAL } from '../types/PriorityEnum'
import spoolTask from './spoolTask'

export const spoolJobFile = ({ jobFileID }) => {
  return async function(dispatch, getState) {
    const state = getState()
    const jobFile = state.jobQueue.jobFiles[jobFileID]

    if (jobFile == null) {
      throw new Error(`jobFile (id: ${ jobFileID }) does not exist`)
    }

    const fileContent = await fs.readFileAsync(jobFile.filePath, 'utf8')

    const action = spoolTask({
      internal: false,
      priority: NORMAL,
      jobID: jobFile.jobID,
      jobFileID: jobFile.id,
      name: jobFile.name,
      data: [fileContent],
    })

    return dispatch(action)
  }
}

export default spoolJobFile
