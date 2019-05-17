import { DateTime } from '@d1plo1d/graphql-scalars'
import GraphQLJSON from 'graphql-type-json'
import { Map } from 'immutable'

import QueryResolvers from './QueryResolvers'
import SubscriptionResolvers from './SubscriptionResolvers'
import MutationResolvers from './MutationResolvers'

import DeviceResolvers from '../../devices/resolvers/DeviceResolvers'

import MaterialResolvers from '../../pluginManager/resolvers/MaterialResolvers'
import PluginResolvers from '../../pluginManager/resolvers/PluginResolvers'

import JobFileResolvers from '../../jobQueue/resolvers/JobFileResolvers'
import JobHistoryEventResolvers from '../../jobQueue/resolvers/JobHistoryEventResolvers'
import JobQueueResolvers from '../../jobQueue/resolvers/JobQueueResolvers'
import JobResolvers from '../../jobQueue/resolvers/JobResolvers'

import ComponentResolvers from '../../printer/resolvers/ComponentResolvers'
import HeaterResolvers from '../../printer/resolvers/HeaterResolvers'
import MovementHistoryEntryResolvers from '../../printer/resolvers/MovementHistoryEntryResolvers'
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

  DeviceResolvers,

  MaterialResolvers,
  PluginResolvers,

  JobFileResolvers,
  JobHistoryEventResolvers,
  JobQueueResolvers,
  JobResolvers,

  ComponentResolvers,
  HeaterResolvers,
  MovementHistoryEntryResolvers,
  PrinterResolvers,

  TaskResolvers,
].reduce(mergeResolvers, {})

const thirdPartyResolvers = {
  JSON: GraphQLJSON,
  DateTime,
}

const resolvers = {
  ...coreResolvers,
  ...thirdPartyResolvers,
}

export default resolvers
