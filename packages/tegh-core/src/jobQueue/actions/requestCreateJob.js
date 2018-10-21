import Job from '../types/Job'

export const REQUEST_CREATE_JOB = 'tegh/jobQueue/REQUEST_CREATE_JOB'

const requestCreateJob = ({ files, name }) => {
  if (name == null) {
    throw new Error('name cannot be null')
  }

  if (files == null) {
    throw new Error('files cannot be null')
  }

  const job = Job({ name })

  return {
    type: REQUEST_CREATE_JOB,
    payload: {
      job,
      files,
    },
  }
}

export default requestCreateJob
