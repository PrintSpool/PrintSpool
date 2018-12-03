import { GraphQLDate } from 'graphql-scalars'
import GraphQLJSON from 'graphql-type-json'
import { Map } from 'immutable'

import QueryResolvers from './QueryResolvers'
import SubscriptionResolvers from './SubscriptionResolvers'
import MutationResolvers from './MutationResolvers'

import PrinterConfigResolvers from '../../config/resolvers/PrinterConfigResolvers'

import ComponentConfigFormResolvers from '../../pluginManager/resolvers/ComponentConfigFormResolvers'
import PluginConfigFormResolvers from '../../pluginManager/resolvers/PluginConfigFormResolvers'
import MaterialResolvers from '../../pluginManager/resolvers/MaterialResolvers'

import JobFileResolvers from '../../jobQueue/resolvers/JobFileResolvers'
import JobHistoryEventResolvers from '../../jobQueue/resolvers/JobHistoryEventResolvers'
import JobQueueResolvers from '../../jobQueue/resolvers/JobQueueResolvers'
import JobResolvers from '../../jobQueue/resolvers/JobResolvers'

import ComponentResolvers from '../../printer/resolvers/ComponentResolvers'
import PrinterResolvers from '../../printer/resolvers/PrinterResolvers'

import TaskResolvers from '../../spool/resolvers/TaskResolvers'

const mergeResolvers = (resolvers, accumulator) => ({
  ...accumulator,
  ...Map(resolvers).map((fieldResolvers, typeName) => ({
    ...accumulator[typeName] || {},
    ...fieldResolvers,
  })).toJS(),
})

const coreResolvers = [
  QueryResolvers,
  MutationResolvers,
  SubscriptionResolvers,

  PrinterConfigResolvers,

  ComponentConfigFormResolvers,
  PluginConfigFormResolvers,
  MaterialResolvers,

  JobFileResolvers,
  JobHistoryEventResolvers,
  JobQueueResolvers,
  JobResolvers,

  ComponentResolvers,
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
