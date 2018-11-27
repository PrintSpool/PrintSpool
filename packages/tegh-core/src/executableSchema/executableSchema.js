import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLDate } from 'graphql-scalars'
import GraphQLJSON from 'graphql-type-json'
import { Map } from 'immutable'

import typeDefs from 'tegh-schema'

// import queryResolvers from './queryResolvers'
import SubscriptionRootResolvers from './SubscriptionRootResolvers'
// import mutationResolvers from './mutationResolvers'

import ConfigMutationRootResolvers from '../config/resolvers/MutationRootResolvers'
import ConfigQueryRootResolvers from '../config/resolvers/QueryRootResolvers'
import ConfigFormResolvers from '../config/resolvers/ConfigFormResolvers'

const mergeResolvers = (resolvers, accumulator) => ({
  ...accumulator,
  ...Map(resolvers).map((fieldResolvers, typeName) => ({
    ...accumulator[typeName] || {},
    ...fieldResolvers,
  })).toJS(),
})

const coreResolvers = [
  ConfigMutationRootResolvers,
  ConfigQueryRootResolvers,
  ConfigFormResolvers,
  SubscriptionRootResolvers,
].reduce(mergeResolvers, {})

const thirdPartyResolvers = {
  JSON: GraphQLJSON,
  Date: GraphQLDate,
}

const resolvers = {
  ...coreResolvers,
  ...thirdPartyResolvers,
}

// const resolvers = {
//   QueryRoot: queryResolvers,
//   SubscriptionRoot: subscriptionResolvers,
//   MutationRoot: mutationResolvers,
// }

const executableSchema = () => makeExecutableSchema({
  typeDefs,
  resolvers,
})

export default executableSchema
