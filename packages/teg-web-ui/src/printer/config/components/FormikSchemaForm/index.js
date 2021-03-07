import React, { useEffect } from 'react'
import Typography from '@material-ui/core/Typography'

import SchemaFieldUI from './SchemaFieldUI'

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
  // hideReadOnlyFields = false,
  register,
  control,
  errors,
}) => {
  return (
    <div className={className}>
      { expandForm({ form, schema }).form.map((name) => {
        const property = schema.properties[name]
        return (
          <SchemaFieldUI
            schema={schema}
            property={property}
            key={name}
            name={`${path}${name}`}
            register={register}
            control={control}
            errors={errors}
          />
        )
      })}
      { errors[''] != null && (
        <Typography
          color="error"
          variant="body1"
          style={{ marginTop: 16 }}
        >
          {'Error: '}
          {
            errors[''].message
            || (typeof errors[''] === 'string' ? errors[''] : 'An unknown error has occured')
          }
        </Typography>
      )}
    </div>
  )
}

export default FormikSchemaForm
