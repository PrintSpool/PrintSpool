import snl from 'strip-newlines'
import {
  GraphQLEnumType,
} from 'graphql'

const JobStatusEnumGraphQL = new GraphQLEnumType({
  name: 'JobStatus',
  values: {
    SPOOL_PRINT: {
      description: snl`
        The subject has a task spooled for printing. It will begin printing
        as soon as the tasks spooled before it finish.
      `,
    },
    START_PRINT: {
      description: snl`
        The subject has a task is in the process of being printed.
      `,
    },
    PRINT_ERROR: {
      description: snl`
        An error occurred durring the print and it has been stopped
        automatically.
      `,
    },
    CANCEL_PRINT: {
      description: snl`
        The subject was halted pre-emptively by a user's action.
      `,
    },
    FINISH_PRINT: {
      description: snl`
        The subject was completed successfully.
      `,
    },
  },
})

export default JobStatusEnumGraphQL
