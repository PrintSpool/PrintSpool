import {
  GraphQLObjectType,
} from 'graphql'
import tql from 'typiql'

import {
  PrinterGraphQL,
  JobGraphQL,
  TaskGraphQL,
} from 'tegh-core'
// import PrinterGraphQL from '../core/printer/types/Printer.graphql'
// import JobGraphQL from '../core/jobQueue/types/Job.graphql'

const QueryRootGraphQL = new GraphQLObjectType({
  name: 'QueryRoot',
  fields: {
    allPrinters: {
      type: tql`[${PrinterGraphQL}!]!`,
      resolve: (_source, _args, context) => [context.store.getState()],
    },

    printer: {
      type: tql`${PrinterGraphQL}!`,
      args: {
        id: {
          type: tql`ID!`,
        },
      },
      resolve(_source, args, { store }) {
        const state = store.getState()
        if (args.id !== state.config.id) {
          throw new Error(`Printer ID ${args.id} does not exist`)
        }
        return state
      },
    },

    task: {
      type: tql`${TaskGraphQL}!`,
      args: {
        id: {
          type: tql`ID!`,
        },
      },
      resolve(_source, args, { store }) {
        const state = store.getState()
        const task = state.spool.allTasks.get(args.id)
        if (task == null) {
          throw new Error(`Task ID ${args.id} does not exist`)
        }
        return task
      },
    },

    jobs: {
      type: tql`[${JobGraphQL}]!`,
      resolve(_source, args, { store }) {
        // console.log(store.getState())
        const { jobQueue } = store.getState()
        const jobs = jobQueue.jobs.toList()
        return jobs
      },
    },

    job: {
      type: tql`${JobGraphQL}!`,
      args: {
        id: {
          type: tql`ID!`,
        },
      },
      resolve(_source, args, { store }) {
        const state = store.getState()
        const job = state.jobQueue.jobs.get(args.id)
        if (job == null) {
          throw new Error(`Job ID ${args.id} does not exist`)
        }
        return job
      },
    },
  },
})

export default QueryRootGraphQL
