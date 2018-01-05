import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql'
import tql from 'typiql'
import PrinterType from './types/printer_type'
import sendGCodeMutation from './mutations/send_gcode_mutation'
import heatersChanged from './subscriptions/heaters_changed_subscription'
import logEntryCreated from './subscriptions/log_entry_created_subscription'

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
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
  }),
  mutation: new GraphQLObjectType({
    name: 'MutationRoot',
    fields: () => ({
      sendGCode: sendGCodeMutation(),
    }),
  }),
  subscription: new GraphQLObjectType({
    name: 'SubscriptionRoot',
    fields: () => ({
      heatersChanged: heatersChanged(),
      logEntryCreated: logEntryCreated(),
    }),
  }),
})

export default schema
