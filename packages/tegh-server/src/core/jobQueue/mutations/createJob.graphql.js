import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLInputObjectType
} from 'graphql'

import actionResolver from '../../util/actionResolver'
import FileInputType from '../../util/FileInput.graphql.js'
import createJob from '../actions/createJob'
import getJob from '../selectors/getJob'

import JobGraphQL from '../types/Job.graphql.js'

const createJobGraphQL = () => ({
  type: tql`${JobGraphQL}!`,
  description: snl`
     create a Job from the content and fileName of a file upload.
  `,

  resolve: actionResolver({
    actionCreator: createJob,
    selector: (state, action) => getJob(state)(action.payload.job.id),
  }),

  args: {
    input: {
      type: new GraphQLInputObjectType({
        name: 'CreateJobInput',
        fields: {
          printerID: {
            type: tql`ID!`,
          },
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
