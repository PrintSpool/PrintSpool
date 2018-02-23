import {default as _fs} from 'fs'

const fs = Promise.promisifyAll(_fs)

export const SPOOL_JOB_FILE = 'tegh/jobQueue/SPOOL_JOB_FILE'

export const spoolJobFile = ({ JobFileID }) => {
  return (dispatch, getState) => {
    const state = getState()
    const jobFile = state.jobQueue.jobFiles[JobFileID]

    const fileContent = await fs.readAsync(jobFile.filePath)

    const action = spoolTask({
      internal: false,
      priority: 'normal',
      jobFileID: jobFile.id,
      file: {
        name: jobFile.name,
        content: fileContent,
      }
    })
    return dispatch(action)
  }
}
