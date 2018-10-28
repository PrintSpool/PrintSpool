import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType,
} from 'graphql'
import { GraphQLDate } from 'graphql-scalars'

import PrinterGraphQL from '../../printer/types/Printer.graphql.js'

import getTaskPercentComplete from '../selectors/getTaskPercentComplete'

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
      resolve: source => source.data.size,
    },
    percentComplete: {
      // TODO: PercentageScalarType
      // type: tql`${PercentageScalarType}!`,
      type: tql`Float!`,
      args: {
        digits: {
          type: tql`Int!`,
          description: snl`
            The number of digits to the right of the decimal place to round to.
            eg.
            \`digits: 0\` => 83
            \`digits: 1\` => 82.6
            \`digits: 2\` => 82.62
          `,
        },
      },
      resolve: (source, { digits }, { store }) => {
        const state = store.getState().spool
        return getTaskPercentComplete(state)({
          taskID: source.id,
          digits,
        })
      },
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
    printer: {
      type: tql`${PrinterGraphQL}!`,
      resolve(_source, args, { store }) {
        const state = store.getState()
        return state
      },
    },
  }),
})

export default TaskType
