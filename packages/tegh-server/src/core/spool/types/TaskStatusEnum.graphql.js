import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLEnumType
} from 'graphql'

const TaskStatusEnumGraphQLType = new GraphQLEnumType({
  name: 'TaskStatus',
  values: {
    SPOOLED: {
      value: 0,
      description: snl`
        The task is spooled for printing.
      `,
    },
    PRINTING: {
      value: 2,
      description: snl`
        The task is in the process of being printed.
      `,
    },
    ERRORED: {
      value: 3,
      description: snl`
        An error occurred durring the print and it has been stopped
        automatically.
      `,
    },
    CANCELLED: {
      value: 3,
      description: snl`
        The task was halted pre-emptively by a user's action.
      `,
    },
    DONE: {
      value: 3,
      description: snl`
        The task was completed successfully.
      `,
    },
  }
})

export default TaskStatusEnumGraphQLType
