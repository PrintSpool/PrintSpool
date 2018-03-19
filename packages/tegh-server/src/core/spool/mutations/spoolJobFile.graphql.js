import tql from 'typiql'
import snl from 'strip-newlines'
import { GraphQLInputObjectType } from 'graphql'

import actionResolver from '../../util/actionResolver'
import spoolJobFile from '../actions/spoolJobFile'
import getTask from '../selectors/getTask'

import TaskGraphQL from '../types/Task.graphql.js'

const SpoolJobFileInputGraphQL = new GraphQLInputObjectType({
  name: 'SpoolJobFileInput',
  fields: {
    printerID: {
      type: tql`ID!`,
    },
    jobFileID: {
      type: tql`ID!`,
    },
  }
})

const spoolJobFileGraphQL = () => ({
  type: tql`${TaskGraphQL}!`,
  description: snl`
    Starts a print by spooling a task to print the job file.
  `,

  resolve: actionResolver({
    actionCreator: spoolJobFile,
    selector: (state, action) => getTask(state)(action.payload.task.id),
  }),

  args: {
    input: {
      type: tql`${SpoolJobFileInputGraphQL}!`
    },
  },
})

export default spoolJobFileGraphQL
