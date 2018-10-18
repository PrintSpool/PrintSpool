import tql from 'typiql'
import snl from 'strip-newlines'
import { GraphQLInputObjectType } from 'graphql'

import actionResolver from '../../util/actionResolver'
import FileInputType from '../../util/FileInput.graphql'
import createJob from '../actions/createJob'

import JobGraphQL from '../types/Job.graphql'

const createJobGraphQL = () => ({
  // type: tql`${JobGraphQL}!`,
  type: tql`Boolean`,
  description: snl`
     create a Job from the content and fileName of a file upload.
  `,

  resolve: actionResolver({
    requirePrinterID: false,
    actionCreator: createJob,
    // TODO: returning the job will not work until thunks are removed from Tegh
    // selector: (state, action) => state.jobQueue.jobs.get(action.payload.job.id),
    selector: () => null,
  }),

  args: {
    input: {
      type: new GraphQLInputObjectType({
        name: 'CreateJobInput',
        fields: {
          name: {
            type: tql`String!`,
          },
          files: {
            type: tql`[${FileInputType}!]!`,
          },
        },
      }),
    },
  },
})

export default createJobGraphQL
