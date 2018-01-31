import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

const LogEntryType = new GraphQLObjectType({
  name: 'LogEntry',
  fields: () => ({
    source: {
      type: tql`String!`,
    },
    level: {
      type: tql`String!`,
    },
    message: {
      type: tql`String!`,
    },
  }),
})

export default LogEntryType
