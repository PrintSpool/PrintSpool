import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLEnumType,
} from 'graphql'

const JobStatusEnumGraphQL = new GraphQLEnumType({
  name: 'JobStatus',
  values: {
    QUEUED: {
      description: snl`
        The subject is queued. Use the spoolJobFile mutation to spool it.
      `,
    },
    SPOOLED: {
      description: snl`
        The subject has a task spooled for printing. It will begin printing
        as soon as the tasks spooled before it finish.
      `,
    },
    PRINTING: {
      description: snl`
        The subject has a task is in the process of being printed.
      `,
    },
    ERRORED: {
      description: snl`
        An error occurred durring the print and it has been stopped
        automatically.
      `,
    },
    CANCELLED: {
      description: snl`
        The subject was halted pre-emptively by a user's action.
      `,
    },
    DONE: {
      description: snl`
        The subject was completed successfully.
      `,
    },
  },
})

export default JobStatusEnumGraphQL
