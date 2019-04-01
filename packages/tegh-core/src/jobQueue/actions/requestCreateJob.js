import Job from '../types/Job'

export const REQUEST_CREATE_JOB = 'tegh/jobQueue/REQUEST_CREATE_JOB'

const requestCreateJob = ({ files, name, meta }) => {
  if (name == null) {
    throw new Error('name cannot be null')
  }

  if (files == null || files.length === 0) {
    throw new Error('requires at least one file')
  }

  const job = Job({ name, meta })

  return {
    type: REQUEST_CREATE_JOB,
    payload: {
      job,
      files,
    },
  }
}

export default requestCreateJob
