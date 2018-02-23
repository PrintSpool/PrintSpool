import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

const TaskType = new GraphQLObjectType({
  name: 'Task',
  description: 'A spooled set of gcodes to be executed by the printer',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    spoolName: {
      type: tql`String!`,
      resolve: source => source.spoolID,
    },
    name: {
      type: tql`String!`,
    },
    currentLineNumber: {
      type: tql`Int`,
    },
    createdAt: {
      type: tql`String!`,
    },
    startedAt: {
      type: tql`String`,
    },
    stoppedAt: {
      type: tql`String`,
    },
    status: {
      type: tql`String!`,
    },
  }),
})

export default TaskType
