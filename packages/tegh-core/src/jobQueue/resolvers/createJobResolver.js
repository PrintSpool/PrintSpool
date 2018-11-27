import tql from 'typiql'
import snl from 'strip-newlines'
import { GraphQLInputObjectType } from 'graphql'

import actionResolver from '../../util/actionResolver'
import requestCreateJob from '../actions/requestCreateJob'

// import JobGraphQL from '../types/Job.graphql.js'

const createJobResolver = actionResolver({
  requirePrinterID: false,
  actionCreator: requestCreateJob,
  // TODO: returning the job will not work until thunks are removed from Tegh
  // selector: (state, action) => state.jobQueue.jobs.get(action.payload.job.id),
  selector: () => null,
})

export default createJobResolver
