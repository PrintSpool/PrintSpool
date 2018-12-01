const getConcreteType = type => (
  type.ofType ? getConcreteType(type.ofType) : type
)

const getType = ({ types, name }) => (
  types.find(type => type.name === name)
)

export const buildAllFieldsQueryString = (options = {}) => {
  const {
    type,
    types,
    indent = '',
    depth = 1,
    buildNestedFieldsQuery = () => '{ id }',
  } = options
  const { fields } = type
  const fieldQueryStrings = fields.map((field) => {
    const typeInField = getType({
      types,
      name: getConcreteType(field.type).name,
    })
    const argsString = ''
    let nestedFieldsQuery = ''

    // if (field.args != null) {
    //   const args = Object.entries(field.args)
    //     .map(([argKey, argValue]) => `${argKey}: ${argValue}`)
    //
    //   argsString = `(${args.join(', ')})`
    // }

    if (typeInField.kind === 'OBJECT') {
      // console.log({field})
      nestedFieldsQuery = buildNestedFieldsQuery({
        ...options,
        type: typeInField,
        indent: `${indent}  `,
        depth: depth + 1,
      })
      nestedFieldsQuery = ` ${nestedFieldsQuery.trim()}`
    }
    if (typeInField.kind === 'UNION') {
      const unionedTypeQueries = typeInField.possibleTypes.map(({ name }) => {
        const unionedType = getType({
          types,
          name,
        })
        const spreadIndent = `${indent}    `
        const unionedTypeFieldsQuery = buildNestedFieldsQuery({
          ...options,
          type: unionedType,
          indent: spreadIndent,
          depth: depth + 1,
        })
        return (
          `${spreadIndent}... on ${name} ${unionedTypeFieldsQuery.trim()}\n`
        )
      })
      nestedFieldsQuery = `{\n${unionedTypeQueries.join('')}${indent}  }`
    }

    return `${indent}  ${field.name}${argsString}${nestedFieldsQuery}\n`
  })

  const allFieldsQuery = (
    `${indent}{\n${
      fieldQueryStrings.join('')
    }${indent}}`
  )

  return allFieldsQuery
}

export const buildFullQueryFromIntrospection = ({
  introspection,
  queryRootFieldsFilter = () => true,
  depth = Number.MAX_SAFE_INTEGER,
}) => {
  if (introspection.errors != null) {
    throw new Error(introspection.errors.map(error => error.message).join(','))
  }
  // eslint-disable-next-line no-underscore-dangle
  const { types, queryType } = introspection.data.__schema
  let queryTypeWithFields = types.find(t => t.name === queryType.name)
  // Apply filter to only query some fields on the Query root
  queryTypeWithFields = {
    ...queryTypeWithFields,
    fields: queryTypeWithFields.fields.filter(queryRootFieldsFilter),
  }

  const buildNestedFieldsQuery = (options) => {
    if (options.depth <= depth) {
      return buildAllFieldsQueryString(options)
    }
    return '{ id }'
  }

  // console.log('start')
  const query = buildAllFieldsQueryString({
    type: queryTypeWithFields,
    types,
    buildNestedFieldsQuery,
  })
  // console.log(query)
  // throw new Error('done')
  return query
}
