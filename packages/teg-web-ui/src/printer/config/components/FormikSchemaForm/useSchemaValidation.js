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

const useSchemaValidation = ({ schema } = {}) => (
  useMemo(() => {
    if (schema == null) return () => ({})
    // console.log({ schema })

    const ajv = new Ajv({
      allErrors: true,
      coerceTypes: true,
    })

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
  }, [schema])
)

export default useSchemaValidation
