import {
  makeExecutableSchema,
  mergeSchemas,
  introspectSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  FilterRootFields,
} from 'graphql-tools'
import { HttpLink } from 'apollo-link-http'

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
  
  while(introspectionResult == null) {
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

  const rustSchema = await makeRemoteExecutableSchema({
    schema: introspectionResult,
    link: new HttpLink({ uri: rustURI })
  })

  const transformedRustSchema = transformSchema(rustSchema, [
    new FilterRootFields(
      (_operation, rootField) => rootField !== 'authenticateUser'
    ),
  ])

  return mergeSchemas({
    schemas: [
      transformedRustSchema,
      nodeJSSchema,
    ],
  })
}

export default executableSchema
