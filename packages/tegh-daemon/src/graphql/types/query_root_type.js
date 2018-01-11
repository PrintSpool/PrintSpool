import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

import PrinterType from './printer_type.js'
import TaskType from './task_type.js'

const QueryRootType = new GraphQLObjectType({
  name: 'QueryRoot',
  fields: {
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
      }
    },
    task: {
      type: tql`${TaskType}!`,
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
      }
    },
    allPrinters: {
      type: tql`[${PrinterType}!]!`,
      resolve: (_source, _args, context) => [context.store.getState()],
    },
  },
})

export default QueryRootType
