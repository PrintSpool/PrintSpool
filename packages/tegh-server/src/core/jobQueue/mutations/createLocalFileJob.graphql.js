import tql from 'typiql'
import {
  GraphQLInputObjectType
} from 'graphql'

import actionResolver from '../../util/actionResolver'
import FileInputType from '../../util/FileInput.graphql.js'
import createLocalFileJob from './createLocalFileJob'

const createLocalFileJobGraphQL = () => ({
  type: tql`${TaskType}!`,
  description: snl`
    creates a job to print a file already on the Tegh server.
  `,

  resolve: actionResolver({
    actionCreator: createLocalFileJob,
  }),

  args: {
    printerID: {
      type: tql`ID!`,
    },
    localPath: {
      type: tql`String`,
    },
  },
})

export default createLocalFileJobGraphQL
