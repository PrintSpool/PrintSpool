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
  schema,
  name,
  property: propertyNoRefs,
  values = {},
}) => {
  if (propertyNoRefs == null) {
    throw new Error(`JSON schema missing type "${name}"`)
  }

  const refMixins = (propertyNoRefs.allOf || [])
    .map(r => schema.definitions[r['$ref'].replace('#/definitions/', '')] );

  refMixins.unshift({...propertyNoRefs})

  const property = refMixins.reduce((a, b) => ({ ...a, ...b }))

  const sharedFieldProps = {
    name,
    key: name,
    label: property.title,
    margin: 'normal',
    disabled: property.readOnly,
    helperText: property.description,
  }

  const gcodeHooks = [
    'beforePrintHook',
    'afterPrintHook',
    'beforeFilamentSwapHook',
  ]

  const multiline = gcodeHooks.includes(name)
  // console.log({ name, multiline })

  const isEnum = property.enum != null

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

      const FieldComponent = isEnum ? Field : FastField
      return (
        <FieldComponent
          {...sharedFieldProps}
          multiline={multiline}
          rows={multiline ? 5 : null}
          type={type}
          select={isEnum}
          component={TextFieldWrapper}
          fullWidth
        >
          { property.enum?.map((option, optionIndex) => (
            <MenuItem key={option} value={option}>
              {(property.enumNames || [])[optionIndex] || option}
            </MenuItem>
          ))}
          { property.enum?.length === 0 && name === 'serialPortID' && (
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
      const { helperText, ...booleanFieldProps } = sharedFieldProps
      return (
        <div
          style={{ marginTop: 24 }}
        >
          <Field
            {...booleanFieldProps}
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
              { property.description && (
                <Typography varaint="body2">
                  {property.description}
                </Typography>
              )}
              {(arrayValues || []).map((value, index) => (
                <FormikSchemaField
                  property={{
                    title: `${property.title} #${index + 1}`,
                    ...property.items,
                  }}
                  name={`${name}[${index}]`}
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  values={values}
                />
              ))}
              <Button onClick={() => push('')}>
                Add
                {' '}
                {property.title}
              </Button>
            </React.Fragment>
          )}
        </FieldArray>
      )
    }
    default: {
      throw new Error(`Unsupported type: ${property.type} (on field: ${name})`)
    }
  }
}

export default FormikSchemaField
