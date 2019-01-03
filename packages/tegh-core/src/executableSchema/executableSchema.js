import { makeExecutableSchema } from 'graphql-tools'

import typeDefs from '@tegh/schema'

import resolvers from './resolvers'

const executableSchema = () => makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
})

export default executableSchema
