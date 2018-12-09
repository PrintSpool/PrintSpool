import React from 'react'
import { FastField } from 'formik'
import { TextField, Switch } from 'formik-material-ui'
import {
  MenuItem,
  FormControlLabel,
} from '@material-ui/core'

const replaceNullValueWith = (field, nullReplacement) => ({
  ...field,
  value: field.value == null ? nullReplacement :  field.value
})

const SwitchWithLabel = props => (
  <div>
    {console.log(props)}
    <FormControlLabel
      label={props.label}
      control={
        <Switch
          {...props}
          field={replaceNullValueWith(props.field, false)}
        />
      }
    />
  </div>
)

const TextFieldWrapper = props => (
  <TextField
    {...props}
    field={replaceNullValueWith(props.field, '')}
  />
)

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
}) => (
  // <TextField
  <div>
    { expandForm({ form, schema }).form.map((name) => {
      const property = schema.properties[name]
      if (property == null) {
        throw new Error(`JSON schema missing type "${name}"`)
      }
      const sharedFieldProps = {
        name: `${path}${name}`,
        key: name,
        label: property.title,
        margin: 'normal',
      }

      switch (property.type) {
        case 'number':
        case 'integer':
        case 'string': {
          const type = property.type === 'string' ? 'text' : 'number'
          return (
            <FastField
              {...sharedFieldProps}
              type={type}
              select={property.enum != null}
              component={TextFieldWrapper}
              fullWidth
            >
              { property.enum && property.enum.map((option, optionIndex) => (
                <MenuItem key={option} value={option}>
                  {(property.enumNames || [])[optionIndex] || option}
                </MenuItem>
              ))}
            </FastField>
          )
        }
        case 'boolean': {
          return (
            <FastField
              {...sharedFieldProps}
              type="checkbox"
              component={SwitchWithLabel}
            />
          )
        }
        default: {
          throw new Error(`Unsupported type: ${property.type}`)
        }
      }
    })}
  </div>
)

export default FormikSchemaForm
