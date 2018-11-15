import {
  GraphQLObjectType,
} from 'graphql'
import tql from 'typiql'

import {
  PrinterGraphQL,
  JobQueueGraphQL,
  // TaskGraphQL,
} from 'tegh-core'
// import PrinterGraphQL from '../core/printer/types/Printer.graphql.js'
// import JobGraphQL from '../core/jobQueue/types/Job.graphql.js'

const QueryRootGraphQL = new GraphQLObjectType({
  name: 'QueryRoot',
  fields: {
    printers: {
      type: tql`[${PrinterGraphQL}!]!`,
      args: {
        id: {
          type: tql`ID`,
        },
      },
      resolve(_source, args, { store }) {
        const state = store.getState()
        if (args.id != null && args.id !== state.config.printer.id) {
          throw new Error(`Printer ID ${args.id} does not exist`)
        }
        return [state]
      },
    },
    jobQueue: {
      type: tql`${JobQueueGraphQL}!`,
      resolve(_source, args, { store }) {
        return store.getState()
      },
    },
  },
})

export default QueryRootGraphQL
