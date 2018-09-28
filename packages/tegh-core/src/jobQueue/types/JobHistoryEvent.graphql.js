import tql from 'typiql'
import {
  GraphQLObjectType,
} from 'graphql'

import JobHistoryTypeEnum from './JobHistoryTypeEnum.graphql'

const JobHistoryEventGraphQL = new GraphQLObjectType({
  name: 'JobHistoryEvent',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    createdAt: {
      type: tql`String!`,
    },
    type: {
      type: tql`${JobHistoryTypeEnum}!`,
    },
  }),
})

export default JobHistoryEventGraphQL
