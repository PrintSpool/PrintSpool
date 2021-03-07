import { useMemo } from 'react'
import Ajv from 'ajv'

// const nullifyEmptyStrings = (data) => {
//   const out = {}
//   Object.entries(data).forEach(([key, value]) => {
//     if (typeof value === 'string' && value.length === 0) out[key] = null
//     if (typeof value === 'object') out[key] = nullifyEmptyStrings(value)
//     out[key] = value
//   })
//   return out
// }

const normalizeProperty = (property) => {
  if (
    [
      'uint64',
      'sint64',
      'uint32',
      'sint32',
      'uint',
      'sint',
      'float',
    ].includes(property.format)
  ) {
    const { format: _, ...nextProperty } = property
    return nextProperty
  } else {
    return property
  }
}

const normalizeAllProperties = (originalProperties = {}) => {
  const properties = {}
  Object.entries(originalProperties || {}).forEach(([key, property]) => {
    // console.log(property)
    properties[key] = normalizeProperty(property)
  })

  return properties
}

export const createValidate = ({ schema: originalSchema } = {}) => {
  if (originalSchema == null) return () => ({})
  // console.log({ originalSchema })

  const ajv = new Ajv({
    allErrors: true,
    coerceTypes: true,
  })

  // Hack: This in-place modification of the schema properties is not ideal but it works.
  const properties = normalizeAllProperties(originalSchema.properties)

  const definitions = {}

  Object.entries(originalSchema.definitions || {}).forEach(([key, definition]) => {
    definitions[key] = {
      ...definition,
      properties: normalizeAllProperties(definition.properties),
    }
  })
  // const properties = {}
  // Object.entries(originalSchema.properties || {}).forEach(([key, property]) => {
  //   // console.log(property)
  //   properties[key] = normalizeProperty(property)
  // })

  const schema = {
    ...originalSchema,
    properties,
    definitions,
  }
  // console.log({ schema, originalSchema })

  const validateWithAJV = ajv.compile(schema)

  const validate = (data) => {
    console.log('VALIDATE', data)
    const valid = validateWithAJV(data)
    const errors = {}

    if (!valid) {
      validateWithAJV.errors.forEach((error) => {
        const fieldName = (
          error.params.missingProperty
          || error.dataPath.replace('.', '')
        )
        if (fieldName === '') {
          // eslint-disable-next-line no-console
          console.error({ error })
        }

        errors[fieldName] = error.message
      })
    }

    // console.log({ errors })
    return {
      values: {},
      errors,
    }
  }

  return validate
}

const useSchemaValidation = ({ schema } = {}) => (
  useMemo(() => {
    createValidate({ schema })
  }, [originalSchema])
)

export default useSchemaValidation
