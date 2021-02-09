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

const useSchemaValidation = ({ schema: originalSchema } = {}) => (
  useMemo(() => {
    if (originalSchema == null) return () => ({})
    // console.log({ originalSchema })

    const ajv = new Ajv({
      allErrors: true,
      coerceTypes: true,
    })

    // Hack: This in-place modification of the schema properties is not ideal but it works.
    const properties = {}
    Object.entries(originalSchema.properties).forEach(([key, property]) => {
      // console.log(property)
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
        properties[key] = nextProperty
      } else {
        properties[key] = property
      }
    })

    const schema = {
      ...originalSchema,
      properties,
    }
    // console.log({ schema })

    const validateWithAJV = ajv.compile(schema)

    const validate = (data) => {
      const valid = validateWithAJV(data)
      const errors = {}

      if (!valid) {
        validateWithAJV.errors.forEach((error) => {
          const fieldName = (
            error.params.missingProperty
            || error.dataPath.replace('.', '')
          )
          errors[fieldName] = error.message
        })
      }

      return errors
    }

    return validate
  }, [originalSchema])
)

export default useSchemaValidation
