import actionResolver from '../../util/actionResolver'
import requestCreateJob from '../actions/requestCreateJob'
import deleteJob from '../actions/deleteJob'

const MutationResolvers = {
  Mutation: {
    createJob: actionResolver({
      requirePrinterID: false,
      actionCreator: requestCreateJob,
      // TODO: returning the job will not work until thunks are removed from Tegh
      // selector: (state, action) => state.jobQueue.jobs.get(action.payload.job.id),
      selector: () => null,
    }),
    deleteJob: actionResolver({
      actionCreator: deleteJob,
      selector: () => null,
      requirePrinterID: false,
    }),
  },
}

export default MutationResolvers
