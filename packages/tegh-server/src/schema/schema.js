import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql'
import _ from 'lodash'

import {
  mutations,
} from 'tegh-core'

import QueryRootGraphQL from './QueryRoot.graphql'
import liveGraphQL from './live.graphql'

const subscriptions = {
  live: liveGraphQL,
}

/*
 * Execute each field definition at the time the field function is called to
 * prevent cyclic reference loading issues.
 */
const fieldsFor = fieldDefinitions => () => (
  _.mapValues(fieldDefinitions, definition => definition())
)

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
