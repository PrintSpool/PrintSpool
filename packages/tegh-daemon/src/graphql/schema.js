import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import tql from 'typiql'
import PrinterType from './types/printer_type.js'

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'QueryRoot',
    fields: {
      printers: {
        type: tql`[${PrinterType}!]!`,
        resolve(_source, _args, context) {
          return context.store
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'MutationRoot',
    fields: {
      sendGCode: {
        type: tql`${PrinterType}!`,
        args: {
          printerID: {
            type: tql`ID!`,
          },
          gcode: {
            type: tql`[String!]!`,
          },
        },
        resolve(source, args) {
          return {
            id: 'lolwat',
            name: `MUTANT things! ${args.gcodes.join(',')}`,
          }
        }
      }
    }
  })
})

export default schema
