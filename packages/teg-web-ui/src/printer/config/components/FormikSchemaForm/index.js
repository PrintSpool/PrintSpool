import React from 'react'

import FormikSchemaField from './FormikSchemaField'

const expandForm = ({
  form,
  schema,
}) => {
  const nextForm = form.reduce((acc, name) => {
    if (name === '*') {
      // expand splats
      const splat = Object.keys(schema.properties).filter(k => (
        form.includes(k) === false
      ))
      return acc.concat(splat)
    }
    acc.push(name)
    return acc
  }, [])

  return {
    form: nextForm,
  }
}

const FormikSchemaForm = ({
  schema,
  form,
  path = '',
  className = null,
  values,
  hideReadOnlyFields = false,
}) => (
  // <TextField
  <div className={className}>
    { expandForm({ form, schema }).form.map((name) => {
      const property = schema.properties[name]
      if (hideReadOnlyFields && property.readOnly) {
        return null
      }
      return (
        <FormikSchemaField
          schema={schema}
          property={property}
          key={name}
          name={`${path}${name}`}
          values={values}
        />
      )
    })}
  </div>
)

export default FormikSchemaForm
