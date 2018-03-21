import {
  parse,
  execute,
  GraphQLSchema,
  introspectionQuery,
} from 'graphql'

const schemaFor = type => new GraphQLSchema({
  query: type
})

const throwGraphQLErrors = queryResult => {
  if (queryResult.errors != null) {
    const error = new Error(queryResult.errors[0].message)
    error.stack = queryResult.errors[0].stack
    throw error
  }
}

const introspectType = async type => {
  const result = await execute(
    schemaFor(type),
    parse(introspectionQuery),
  )
  throwGraphQLErrors(result)

  const { types, queryType } = result.data.__schema
  return types.find(type => type.name === queryType.name)
}

const getKind = field => {
  return field.ofType && getKind(field.ofType) || field.kind
}


const queryAllFields = async (type, fieldConfigs = {}, executeConfig = {}) => {
  const { fields } = await introspectType(type)

  const schema = schemaFor(type)

  const fieldQueryStrings = fields.map(field => {
    const config = fieldConfigs[field.name]
    let argsString = ''
    let nestedFieldsQuery = ''

    if (config != null && config.args != null) {
      const args = Object.entries(config.args)
        .map(([argKey, argValue]) => `${argKey}: ${argValue}`)

      argsString = `(${args.join(', ')})`
    }

    if (getKind(field.type) === 'OBJECT') {
      nestedFieldsQuery = '{ id }'
    }

    return `  ${field.name}${argsString}${nestedFieldsQuery}\n`
  })

  const allFieldsQuery = (
    '{\n' +
      fieldQueryStrings.join('') +
    '}'
  )

  const result = await execute(
    schema,
    parse(allFieldsQuery),
    executeConfig.rootValue,
    executeConfig.contextValue,
    executeConfig.variableValues,
  )

  throwGraphQLErrors(result)

  return result.data
}

const snapshotTestGraphQLType = (description, config) => {
  const {
    type,
    fieldConfigs,
    rootValue,
    contextValue,
    variableValues,
  } = config

  const executeConfig = { rootValue, contextValue, variableValues }

  describe(description, () => {
    it('presents a consistent API', async () => {
      const result = await introspectType(type)

      expect(result).toMatchSnapshot()
    })

    it('resolves every field without error', async () => {
      const result = await queryAllFields(type, fieldConfigs, executeConfig)

      /* omit dynamic fields such as timestamps from the snapshot */
      const dynamicFields = Object.entries(fieldConfigs)
        .filter(([_key, config]) => config.dynamic === true)

      for (const [dynamicField] of dynamicFields) {
        if (result[dynamicField] == null) {
          throw new Error(`dynamic field ${dynamicField} is null`)
        }
        result[dynamicField] = '[DYNAMIC FIELD OMITTED]'
      }

      const omitID = field => {
        if (field && field.id != null) field.id = '[DYNAMIC FIELD OMITTED]'
        if (Array.isArray(field)) field.forEach(omitID)
      }


      for (const field of Object.values(result)) {
        omitID(field)
      }

      expect(result).toMatchSnapshot()
    })
  })
}

export default snapshotTestGraphQLType
