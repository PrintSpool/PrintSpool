import React from 'react'
import { FastField, Field, FieldArray } from 'formik'
import { TextField, Switch } from 'formik-material-ui'
import {
  MenuItem,
  FormControlLabel,
  Button,
  Typography,
  Hidden,
} from '@material-ui/core'

import Typeahead from '../../../../../common/Typeahead'
import useMachineDefSuggestions from '../../../../../common/hooks/useMachineDefSuggestions'


const replaceNullValueWith = (field, nullReplacement) => ({
  ...field,
  value: field.value == null ? nullReplacement : field.value,
})

const SwitchWithLabel = props => (
  <div>
    <FormControlLabel
      label={props.label}
      control={(
        <Switch
          {...props}
          field={replaceNullValueWith(props.field, false)}
        />
      )}
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

const FormikSchemaField = ({
  name,
  property,
  values = {},
}) => {
  if (property == null) {
    throw new Error(`JSON schema missing type "${name}"`)
  }
  const sharedFieldProps = {
    name,
    key: name,
    label: property.title,
    margin: 'normal',
  }

  const {
    suggestions,
    // loading: loadingMachineDefs,
  } = name === 'machineDefinitionURL' ? useMachineDefSuggestions() : {}

  switch (property.type) {
    case 'number':
    case 'integer':
    case 'string': {
      const type = property.type === 'string' ? 'text' : 'number'

      if (name === 'machineDefinitionURL') {
        return (
          <Typeahead
            suggestions={suggestions}
            name={name}
            label={property.title}
          />
        )
      }

      const FieldComponent = property.enum ? Field : FastField
      return (
        <FieldComponent
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
          { property.enum && property.enum.length === 0 && name === 'serialPortID' && (
            <MenuItem value="">
              No serial devices detected.
              <Hidden smDown>
                {' '}
                Please attach your 3D printer's USB cable.
              </Hidden>
            </MenuItem>
          )}
        </FieldComponent>
      )
    }
    case 'boolean': {
      return (
        <Field
          {...sharedFieldProps}
          component={SwitchWithLabel}
        />
      )
    }
    case 'array': {
      const arrayValues = name
        .replace(']', '')
        .split(/[.[]/g)
        .reduce((acc, k) => acc[k], values)

      return (
        <FieldArray name={name}>
          {({ push }) => (
            <React.Fragment>
              <Typography varaint="body1">
                {property.title}
              </Typography>
              {(arrayValues || []).map((value, index) => (
                <FormikSchemaField
                  property={{
                    title: `${property.title} #${index+1}`,
                    ...property.items
                  }}
                  name={`${name}[${index}]`}
                  key={index}
                  values={values}
                />
              ))}
              <Button onClick={() => push('') }>
                Add {property.title}
              </Button>
            </React.Fragment>
          )}
        </FieldArray>
      )
    }
    default: {
      throw new Error(`Unsupported type: ${property.type}`)
    }
  }
}

const FormikSchemaForm = ({
  schema,
  form,
  path = '',
  className,
  values,
}) => (
  // <TextField
  <div className={className}>
    { expandForm({ form, schema }).form.map((name) => {
      const property = schema.properties[name]

      return (
        <FormikSchemaField
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
