const getConcreteType = type => (
  type.ofType ? getConcreteType(type.ofType) : type
)

const getType = ({ types, name }) => (
  types.find(type => type.name === name)
)

const createArgsString = entries => (
  entries.map((entry) => {
    const [key] = entry
    let [, value] = entry
    if (
      typeof value === 'object'
      && value.length === 2
      && value[0] === '__ENUM'
    ) {
      // eslint-disable-next-line prefer-destructuring
      value = value[1]
    } else if (typeof value === 'object' && typeof value.length === 'number') {
      const createArgForListItem = (v) => {
        if (typeof v === 'object') createArgsString(Object.entries(v))
        return JSON.stringify(v)
      }
      value = `[${value.map(createArgForListItem)}]`
    } else if (typeof value === 'object') {
      value = `{ ${createArgsString(Object.entries(value))} }`
    } else {
      value = JSON.stringify(value)
    }
    return `${key}: ${value}`
  }).join(', ')
)

export const buildAllFieldsQueryString = (options = {}) => {
  const {
    type,
    types,
    indent = '',
    depth = 1,
    fieldArgs = {},
    buildNestedFieldsQuery = () => '{ id }',
  } = options

  const { fields } = type

  const fieldQueryStrings = fields.map((field) => {
    const typeInField = getType({
      types,
      name: getConcreteType(field.type).name,
    })

    const childFieldArgs = (fieldArgs.children || {})[field.name] || {}

    let argsString = createArgsString(Object.entries(childFieldArgs.args || {}))

    if (argsString.length > 0) {
      argsString = `(${argsString})`
    }

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
        fieldArgs: childFieldArgs,
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
          fieldArgs: childFieldArgs,
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
  fieldArgs,
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
    fieldArgs,
    buildNestedFieldsQuery,
  })
  // console.log(query)
  // throw new Error('done')
  return query
}
