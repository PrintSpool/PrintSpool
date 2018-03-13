import tql from 'typiql'
import {
  GraphQLInputObjectType
} from 'graphql'

import actionResolver from '../../util/actionResolver'
import FileInputType from '../../util/FileInput.graphql.js'
import createJob from './createJob'

const createJobGraphQL = () => ({
  type: tql`${TaskType}!`,
  description: snl`
   a job can be created from either a local file path on the server or the
   content and fileName of a file upload.
  `,

  resolve: actionResolver({
    actionCreator: createJob,
  }),

  args: {
    printerID: {
      type: tql`ID!`,
    },
    file: {
      type: tql`${FileInputType}`,
    },
    localPath: {
      type: tql`String`,
    },
  },
})

export default createJobGraphQL
