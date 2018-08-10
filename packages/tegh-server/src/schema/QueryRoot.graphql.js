import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

import PrinterType from '../core/printer/types/Printer.graphql.js'
import TaskType from '../core/spool/types/Task.graphql.js'
import JobType from '../core/jobQueue/types/Job.graphql.js'

const QueryRootGraphQL = new GraphQLObjectType({
  name: 'QueryRoot',
  fields: {

    allPrinters: {
      type: tql`[${PrinterType}!]!`,
      resolve: (_source, _args, context) => [context.store.getState()],
    },

    printer: {
      type: tql`${PrinterType}!`,
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

    // task: {
    //   type: tql`${TaskType}!`,
    //   args: {
    //     id: {
    //       type: tql`ID!`,
    //     },
    //   },
    //   resolve(_source, args, { store }) {
    //     const state = store.getState()
    //     const task = state.spool.allTasks.get(args.id)
    //     if (task == null) {
    //       throw new Error(`Task ID ${args.id} does not exist`)
    //     }
    //     return task
    //   }
    // },

    jobs: {
      type: tql`[${JobType}]!`,
      resolve(_source, args, { store }) {
        // console.log(store.getState())
        const { jobQueue } = store.getState()
        const jobs = jobQueue.jobs.toList()
        return jobs
      },
    },

    job: {
      type: tql`${JobType}!`,
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
