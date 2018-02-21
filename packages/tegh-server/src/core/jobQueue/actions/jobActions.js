import Job from '../types/Job'

export const CREATE_JOB = 'tegh/jobQueue/CREATE_JOB'
export const DELETE_JOB = 'tegh/jobQueue/DELETE_JOB'
export const CANCEL_JOB = 'tegh/jobQueue/CANCEL_JOB'

const createArrayOfLength = (length, fn) => (
  Array(length).fill(null).map(fn)
)

export const createJob = attrs => {
  const job = Job(attrs)
  const tasks = job.files
    .map(file => createArrayOfLength(file.quantity, () => {
      Task({ jobID: job.id })
    }))
    .flatten()
  return {
    type: CREATE_JOB,
    job,
    tasks,
  }
}

export const deleteJob = ({ jobID }) => ({
  type: DELETE_JOB,
  jobID,
})

export const cancelJob = ({ jobID }) => ({
  type: CANCEL_JOB,
  jobID,
})
