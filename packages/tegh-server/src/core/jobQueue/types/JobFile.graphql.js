import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

const JobFileGraphQLType = new GraphQLObjectType({
  name: 'JobFile',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    name: {
      type: tql`String!`,
    },
    quantity: {
      type: tql`Int!`,
    },
    // status: {
    //   type: tql`${JobStatusGraphQLEnum}!`,
    // },
  })
})

export default JobFileGraphQLType
