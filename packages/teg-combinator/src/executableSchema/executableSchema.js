import { makeExecutableSchema } from 'graphql-tools'

import typeDefs from '@tegapp/schema'

import resolvers from './resolvers'

const executableSchema = () => makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
})

export default executableSchema
