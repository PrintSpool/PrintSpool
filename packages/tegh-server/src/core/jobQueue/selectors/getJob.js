import getJobs from './getJobs'

const getJob = state => jobID => {
  return getJobs(state).get(jobID)
}

export default getJob
