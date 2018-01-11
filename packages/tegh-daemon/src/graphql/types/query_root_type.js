import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

import PrinterType from './printer_type.js'

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
    allPrinters: {
      type: tql`[${PrinterType}!]!`,
      resolve: (_source, _args, context) => [context.store.getState()],
    },
  },
})

export default QueryRootType
