import tmp from 'tmp-promise'

import fs from '../../util/promisifiedFS'
import Job from '../types/Job'
import JobFile from '../types/JobFile'

export const CREATE_JOB = 'tegh/jobQueue/CREATE_JOB'

const createJob = ({ files, name }) => async (dispatch) => {
  if (name == null) {
    throw new Error('name cannot be null')
  }

  if (files == null) {
    throw new Error('files cannot be null')
  }

  const job = Job({ name })
  const jobFiles = {}

  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    if (typeof file.name !== 'string') {
      throw new Error('file name must be a string')
    }

    if (typeof file.content !== 'string') {
      throw new Error('file content must be a string')
    }

    const tmpFile = await tmp.file()
    const filePath = tmpFile.path
    await fs.writeFileAsync(filePath, file.content)

    const jobFile = JobFile({
      jobID: job.id,
      name: file.name,
      filePath,
      isTmpFile: true,
      quantity: 1,
    })

    jobFiles[jobFile.id] = jobFile
  }

  const action = {
    type: CREATE_JOB,
    payload: {
      job,
      jobFiles,
    },
  }

  return dispatch(action)
}

export default createJob
