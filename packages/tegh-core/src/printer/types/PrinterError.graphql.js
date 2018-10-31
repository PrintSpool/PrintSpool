import {
  GraphQLObjectType,
} from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

const PrinterErrorType = new GraphQLObjectType({
  name: 'PrinterError',
  fields: () => ({
    code: {
      type: tql`String!`,
      description: snl`
        A machine-readable code indicating the type of error
      `,
    },
    message: {
      type: tql`String!`,
      description: snl`
        A human-readable description of the error
      `,
    },
  }),
})

export default PrinterErrorType
