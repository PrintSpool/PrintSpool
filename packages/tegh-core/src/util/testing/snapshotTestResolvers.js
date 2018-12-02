import {
  execute,
  parse,
  introspectionQuery,
} from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'

import resolvers from '../../executableSchema/resolvers'
import { buildFullQueryFromIntrospection } from './graphQLFullQueryTools'

const snapshotTestResolvers = ({
  typeName,

  typeDefs,

  rootValue,
  contextValue,
  variableValues,
}) => {
  const testFieldName = `_test${typeName}`

  const testSchema = makeExecutableSchema({
    typeDefs: [
      ...typeDefs,
      `
        extend type Query {
          ${testFieldName}: ${typeName}!
        }
      `,
    ],
    resolvers: {
      ...resolvers,
      Query: {
        ...resolvers.Query,
        [testFieldName]: source => source,
      },
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  })

  const introspection = execute(
    testSchema,
    parse(introspectionQuery),
  )

  const allFieldsQuery = buildFullQueryFromIntrospection({
    introspection,
    queryRootFieldsFilter: field => field.name === testFieldName,
    depth: 2,
  })

  const { errors, data } = execute(
    testSchema,
    parse(allFieldsQuery),
    rootValue,
    contextValue,
    variableValues,
  )

  expect(errors).toEqual(undefined)
  expect(data).toMatchSnapshot()
}

export default snapshotTestResolvers
