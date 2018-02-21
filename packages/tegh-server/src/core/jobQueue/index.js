import Job from './Job'
import Task from './Task'

const initialState = Record({
  jobs: Map(),
})()

const jobQueue = (state = initialState, action) => {
  switch(action.type) {
    case CREATE_JOB: {
      const { job } = action
      return state.setIn(['jobs', job.id], job))
    }
    case DELETE_JOB: {
      return state.deleteIn(['jobs', action.jobID])
    }
    default: {
      return state
    }
  }
}

export default jobQueue
