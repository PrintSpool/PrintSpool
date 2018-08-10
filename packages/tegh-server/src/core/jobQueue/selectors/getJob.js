import getJobs from './getJobs'

const getJob = state => jobID => getJobs(state).get(jobID)

export default getJob
