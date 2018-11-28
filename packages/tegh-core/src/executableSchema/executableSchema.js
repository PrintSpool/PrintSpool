import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLDate } from 'graphql-scalars'
import GraphQLJSON from 'graphql-type-json'
import { Map } from 'immutable'

import typeDefs from 'tegh-schema'

import QueryRootResolvers from './QueryRootResolvers'
import SubscriptionRootResolvers from './SubscriptionRootResolvers'
// import mutationResolvers from './mutationResolvers'

import ConfigMutationRootResolvers from '../config/resolvers/MutationRootResolvers'
import ConfigQueryRootResolvers from '../config/resolvers/QueryRootResolvers'
import ConfigFormResolvers from '../pluginManager/resolvers/ConfigFormResolvers'
import PrinterConfigResolvers from '../config/resolvers/PrinterConfigResolvers'

import JobQueueResolvers from '../jobQueue/resolvers/JobQueueResolvers'

import PrinterResolvers from '../printer/resolvers/PrinterResolvers'

const mergeResolvers = (resolvers, accumulator) => ({
  ...accumulator,
  ...Map(resolvers).map((fieldResolvers, typeName) => ({
    ...accumulator[typeName] || {},
    ...fieldResolvers,
  })).toJS(),
})

const coreResolvers = [
  QueryRootResolvers,
  SubscriptionRootResolvers,

  ConfigMutationRootResolvers,
  ConfigQueryRootResolvers,
  ConfigFormResolvers,
  PrinterConfigResolvers,

  JobQueueResolvers,

  PrinterResolvers,
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
