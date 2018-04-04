import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql'
import tql from 'typiql'
import _ from 'lodash'

import QueryRootGraphQL from './QueryRoot.graphql.js'
import * as mutations from '../core/mutations'
import * as subscriptionModules from '../core/subscriptions'
import liveGraphQL from './live.graphql.js'

const subscriptions = {
  ..._.mapValues(subscriptionModules, m => m.subscription),
  live: liveGraphQL,
}

/*
 * Execute each field definition at the time the field function is called to
 * prevent cyclic reference loading issues.
 */
const fieldsFor = (fieldDefinitions) => () => {
  return _.mapValues(fieldDefinitions, definition => definition())
}

const schema = new GraphQLSchema({
  query: QueryRootGraphQL,
  mutation: new GraphQLObjectType({
    name: 'MutationRoot',
    fields: fieldsFor(mutations),
  }),
  subscription: new GraphQLObjectType({
    name: 'SubscriptionRoot',
    fields: fieldsFor(subscriptions),
  }),
})

export default schema
