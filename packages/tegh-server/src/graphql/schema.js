import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql'
import tql from 'typiql'
import _ from 'lodash'

import QueryRootType from './types/query_root_type'
import * as mutations from './mutations/'
import * as subscriptionModules from './subscriptions'

const subscriptions = _.mapValues(subscriptionModules, m => m.subscription)

/*
 * Execute each field definition at the time the field function is called to
 * prevent cyclic reference loading issues.
 */
const fieldsFor = (fieldDefinitions) => () => {
  return _.mapValues(fieldDefinitions, definition => definition())
}

const schema = new GraphQLSchema({
  query: QueryRootType,
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
