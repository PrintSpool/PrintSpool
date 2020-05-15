import {
  makeExecutableSchema,
  mergeSchemas,
  introspectSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  FilterRootFields,
} from 'graphql-tools'
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'

import typeDefs from '@tegapp/schema'

import resolvers from './resolvers'

const executableSchema = async () => {
  const nodeJSSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  })

  const rustURI = 'http://localhost:33005/graphql'

  let introspectionResult

  while (introspectionResult == null) {
    try {
      console.error('Connecting to rust server...')
      introspectionResult = await introspectSchema(
        new HttpLink({ uri: rustURI }),
      )
      console.error('Connecting to rust server... [DONE]')
    } catch (e) {
      console.error('Unable to connect to rust server. Retrying in 500ms.')
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log(introspectionResult)

  const link = setContext((request, previousContext) => ({
    headers: {
      'user-id': previousContext.graphqlContext.user.id,
      'peer-identity-public-key': previousContext.graphqlContext.peerIdentityPublicKey,
    },
  })).concat(new HttpLink({ uri: rustURI }))

  const rustSchema = await makeRemoteExecutableSchema({
    schema: introspectionResult,
    link,
  })

  const ommittedFields = [
    'authenticateUser',
    'createInvite',
    'updateInvite',
    'deleteInvite',
    'updateUser',
    'deleteUser',
  ]

  const transformedRustSchema = transformSchema(rustSchema, [
    new FilterRootFields(
      (_operation, rootField) => ommittedFields.includes(rootField) === false,
    ),
  ])

  return mergeSchemas({
    schemas: [
      nodeJSSchema,
      transformedRustSchema,
    ],
  })
}

export default executableSchema
