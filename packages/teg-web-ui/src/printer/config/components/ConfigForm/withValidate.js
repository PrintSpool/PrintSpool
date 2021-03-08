import React, { useMemo } from 'react'
import Ajv from 'ajv'
import useSchemaValidation from './useSchemaValidation'

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

export const useValidate = useSchemaValidation

const withValidate = Component => (props) => {
  const validate = useValidate(props)

  return (
    <Component validate={validate} {...props} />
  )
}

export default withValidate
