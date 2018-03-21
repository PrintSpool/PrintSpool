import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'
import { GraphQLDate } from 'graphql-scalars'

const TaskType = new GraphQLObjectType({
  name: 'Task',
  description: 'A spooled set of gcodes to be executed by the printer',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    name: {
      type: tql`String!`,
    },
    currentLineNumber: {
      type: tql`Int`,
    },
    totalLineNumbers: {
      type: tql`Int!`,
      resolve: source => source.data.size
    },
    percentComplete: {
      // TODO: PercentageScalarType
      // type: tql`${PercentageScalarType}!`,
      type: tql`Float!`,
      resolve: source => source.currentLineNumber / source.data.size * 100
    },
    createdAt: {
      type: tql`${GraphQLDate}!`,
    },
    startedAt: {
      type: tql`${GraphQLDate}`,
    },
    stoppedAt: {
      type: tql`${GraphQLDate}`,
    },
    status: {
      type: tql`String!`,
    },
  }),
})

export default TaskType
