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

import Typeahead from '../../../../common/Typeahead'

const replaceNullValueWith = (field, nullReplacement) => ({
  ...field,
  value: field.value == null ? nullReplacement : field.value,
})

const SwitchWithLabel = ({
  label,
  field,
  ...props
}) => (
  <div>
    <FormControlLabel
      label={label}
      control={(
        <Switch
          {...props}
          field={replaceNullValueWith(field, false)}
        />
      )}
    />
  </div>
)

const TextFieldWrapper = ({
  field,
  ...props
}) => (
  <TextField
    {...props}
    field={replaceNullValueWith(field, '')}
  />
)

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
    disabled: property.readOnly,
  }

  switch (property.type) {
    case 'number':
    case 'integer':
    case 'string': {
      const type = property.type === 'string' ? 'text' : 'number'

      if (name === 'machineDefinitionURL') {
        return (
          <Typeahead
            suggestions={property.suggestions}
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
        <div
          style={{ marginTop: 24 }}
        >
          <Field
            {...sharedFieldProps}
            component={SwitchWithLabel}
          />
        </div>
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

export default FormikSchemaField
