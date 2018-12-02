import { GraphQLDate } from 'graphql-scalars'
import GraphQLJSON from 'graphql-type-json'
import { Map } from 'immutable'

import QueryRootResolvers from './QueryRootResolvers'
import SubscriptionRootResolvers from './SubscriptionRootResolvers'
// import mutationResolvers from './mutationResolvers'

import ConfigMutationRootResolvers from '../config/resolvers/MutationRootResolvers'
import ConfigQueryRootResolvers from '../config/resolvers/QueryRootResolvers'
import PrinterConfigResolvers from '../config/resolvers/PrinterConfigResolvers'

import ComponentConfigFormResolvers from '../pluginManager/resolvers/ComponentConfigFormResolvers'
import PluginConfigFormResolvers from '../pluginManager/resolvers/PluginConfigFormResolvers'
import MaterialResolvers from '../pluginManager/resolvers/MaterialResolvers'

import JobFileResolvers from '../jobQueue/resolvers/JobFileResolvers'
import JobHistoryEventResolvers from '../jobQueue/resolvers/JobHistoryEventResolvers'
import JobQueueResolvers from '../jobQueue/resolvers/JobQueueResolvers'
import JobResolvers from '../jobQueue/resolvers/JobResolvers'
import JobQueueMutationResolvers from '../jobQueue/resolvers/MutationResolvers'

import HeaterResolvers from '../printer/resolvers/HeaterResolvers'
import PrinterResolvers from '../printer/resolvers/PrinterResolvers'

import TaskResolvers from '../spool/resolvers/TaskResolvers'

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
  PrinterConfigResolvers,

  ComponentConfigFormResolvers,
  PluginConfigFormResolvers,
  MaterialResolvers,

  JobFileResolvers,
  JobHistoryEventResolvers,
  JobQueueResolvers,
  JobResolvers,
  JobQueueMutationResolvers,

  HeaterResolvers,
  PrinterResolvers,

  TaskResolvers,
].reduce(mergeResolvers, {})

const thirdPartyResolvers = {
  JSON: GraphQLJSON,
  Date: GraphQLDate,
}

const resolvers = {
  ...coreResolvers,
  ...thirdPartyResolvers,
}

export default resolvers
