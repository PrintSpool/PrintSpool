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

export const createValidate = ({
  schema: originalSchema,
}): (any) => { values: any, errors: any} => {
  console.log({ originalSchema })

  const ajv = new Ajv({
    allErrors: true,
    coerceTypes: true,
  })

  // Hack: This in-place modification of the schema properties is not ideal but it works.
  const properties = normalizeAllProperties(originalSchema.properties)

  const definitions = {}

  Object.entries(originalSchema.definitions || {}).forEach(([key, definition]: any) => {
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

  const isFlatArray = (k) => {
    const property = originalSchema.properties[k]
    // console.log({ property })
    return (
      property.type === 'array'
      && property.items.type !== 'object'
    )
  }

  const validate = ({ model, ...values }) => {
    // console.log('VALIDATE', model)
    // Replace react-hook-form nested object arrays with flat arrays
    const normalizedModel = {}
    Object.entries(model).forEach(([k, v]) => {
      console.log(k)

      if (isFlatArray(k)) {
        // console.log({ v })
        normalizedModel[k] = (v||[] as any).map(({ value }) => value)
      } else {
        normalizedModel[k] = v
      }
    })

    const valid = validateWithAJV(normalizedModel)
    const errors = {}

    if (!valid) {
      validateWithAJV.errors.forEach((error) => {
        const fieldPath = (
          error.params.missingProperty
          || error.dataPath.replace('.', '')
        )
          .split('/')

        let fieldName = fieldPath
          .filter(key => key.length > 0)
          .map(key => key.match(/[0-9]/) != null ? `[${key}]` : `.${key}`)
          .join('')

        // console.log(fieldPath)
        if (fieldPath.length == 2 && isFlatArray(fieldPath[1])) {
          fieldName = `${fieldName}.value`
        }

        if (fieldName === '') {
          // eslint-disable-next-line no-console
          console.error({ error })
        }

        errors[`model${fieldName}`] = error.message
      })
    }

    console.log({ normalizedModel, errors, ajv: validateWithAJV.errors })
    return {
      values: {
        ...values,
        model: normalizedModel
      },
      errors,
    }
  }

  return validate
}

const useSchemaValidation = ({ schema = null } = {}) => (
  useMemo(() => {
    if (schema) {
      return createValidate({ schema })
    } else {
      return null
    }
  }, [schema])
)

export default useSchemaValidation
