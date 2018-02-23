import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

const JobGraphQLType = new GraphQLObjectType({
  name: 'Job',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    name: {
      type: tql`String!`,
    },
    files: {
      type: tql`[${JobFileGraphQLType}!]!`,
    },
    createdAt: {
      type: tql`String!`,
    },
    startedAt: {
      type: tql`String!`,
    },
    stoppedAt: {
      type: tql`String!`,
    },
    // status: {
    //   type: tql`${JobStatusGraphQLEnum}!`,
    // },
  })
})

export default JobGraphQLType
