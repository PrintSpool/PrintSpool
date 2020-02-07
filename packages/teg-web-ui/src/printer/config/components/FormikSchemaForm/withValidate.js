import React, { useMemo } from 'react'
import Ajv from 'ajv'

// !!!!!!!!!!!!!!!!!
// DEPRECATED
//
// Please use useSchemaValidation instead.
// !!!!!!!!!!!!!!!!!


// const nullifyEmptyStrings = (data) => {
//   const out = {}
//   Object.entries(data).forEach(([key, value]) => {
//     if (typeof value === 'string' && value.length === 0) out[key] = null
//     if (typeof value === 'object') out[key] = nullifyEmptyStrings(value)
//     out[key] = value
//   })
//   return out
// }

export const useValidate = ({ schema }) => (
  useMemo(() => {
    if (schema == null) return () => ({})

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

const withValidate = Component => (props) => {
  const validate = useValidate(props)

  return (
    <Component validate={validate} {...props} />
  )
}

export default withValidate
