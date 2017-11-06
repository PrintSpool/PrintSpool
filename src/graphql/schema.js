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
        resolve() {
          return [{
            id: 'lolwat',
            currentTemp: 95.3,
          }]
        }
      }
    }
  })
})

export default schema
