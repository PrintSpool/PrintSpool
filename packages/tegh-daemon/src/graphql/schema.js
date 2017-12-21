import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql'
import tql from 'typiql'
import PrinterType from './types/printer_type'
import sendGCodeMutation from './mutations/send_gcode_mutation'

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'QueryRoot',
    fields: {
      printers: {
        type: tql`[${PrinterType}!]!`,
        resolve: (_source, _args, context) => [context.store.getState()],
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'MutationRoot',
    resolve: (_source, _args, context) => context.store.getState(),
    fields: () => ({
      sendGCode: sendGCodeMutation(),
    }),
  }),
})

export default schema
