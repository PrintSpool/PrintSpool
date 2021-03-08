import React, { useContext } from 'react'
import Typography from '@material-ui/core/Typography'

import SchemaField from './SchemaField'
import { ConfigFormContext } from './ConfigForm'

export const ConfigFields = () => {
  const {
    schema,
    form,
    register,
    control,
    errors,
  } = useContext(ConfigFormContext)

  return (
    <>
      { form.map((name) => (
        <SchemaField
          schema={schema}
          property={schema.properties[name]}
          key={name}
          name={name}
          register={register}
          control={control}
          errors={errors}
        />
      ))}
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
    </>
  )
}

export default ConfigFields
