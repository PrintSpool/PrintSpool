import tql from 'typiql'
import {
  GraphQLInputObjectType
} from 'graphql'

import actionResolver from '../../util/actionResolver'
import spoolJobFile from './spoolJobFile'

const spoolJobFileGraphQL = () => ({
  type: tql`${JobFileType}!`,
  description: snl`
    Starts a print by spooling a task to print the job file.
  `,

  resolve: actionResolver({
    actionCreator: spoolJobFile,
    selector: (state, action) => (
      state.spool.allTasks[action.payload.id]
    ),
  }),

  args: {
    printerID: {
      type: tql`ID!`,
    },
    jobFileID: {
      type: tql`ID!`,
    },
  },
})

export default spoolJobFileGraphQL
