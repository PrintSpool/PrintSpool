import React from 'react'
import { useFieldArray } from 'react-hook-form'
import MenuItem from '@material-ui/core/MenuItem'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Hidden from '@material-ui/core/Hidden'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

// import Typeahead from '../../../../common/Typeahead'

const SchemaFieldUI = ({
  schema,
  name,
  property: propertyNoRefs,
  register,
  control,
  errors,
}) => {
  // Apply schema refs to get the final schema property values
  if (propertyNoRefs == null) {
    throw new Error(`JSON schema missing type "${name}"`)
  }

  const refMixins = (propertyNoRefs.allOf || [])
    .map(r => schema.definitions[r['$ref'].replace('#/definitions/', '')] );

  refMixins.unshift({...propertyNoRefs})

  const property = refMixins.reduce((a, b) => ({ ...a, ...b }))

  // Get the common material ui props from the schema property
  const sharedFieldProps = {
    inputRef: register,
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

  let type = property.type
  if (typeof type == 'object') {
    type = type[0]
  }

  switch (type) {
    case 'number':
    case 'integer':
    case 'string': {
      const componentType = type === 'string' ? 'text' : 'number'

      // if (name === 'machineDefinitionURL') {
      //   return (
      //     <Typeahead
      //       suggestions={property.suggestions}
      //       name={name}
      //       label={property.title}
      //     />
      //   )
      // }

      return (
        <TextField
          {...sharedFieldProps}
          error={errors[name] != null}
          helperText={errors[name]?.message || errors[name]}
          multiline={multiline}
          rows={multiline ? 5 : null}
          type={componentType}
          select={isEnum}
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
        </TextField>
      )
    }
    case 'boolean': {
      const { helperText, label, ...switchProps } = sharedFieldProps
      return (
        <div
          style={{ marginTop: 24 }}
        >
          <FormControlLabel
            label={label}
            ref={register}
            control={(
              <Switch
                {...switchProps}
              />
            )}
          />
        </div>
      )
    }
    case 'array': {
      const { fields, append, remove } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name, // unique name for your Field Array
        // keyName: "id", default to "id", you can change the key name
      })

      return (
        <FieldArray name={name}>
          {fields.map((field) => (
            <React.Fragment key={field.id}>
              <Typography varaint="body1">
                {property.title}
              </Typography>
              { property.description && (
                <Typography varaint="body2">
                  {property.description}
                </Typography>
              )}
              {fields.map((field, index) => (
                <>
                  <SchemaFieldUI
                    key={field.id}
                    property={{
                      title: `${property.title} #${index + 1}`,
                      ...property.items,
                    }}
                    name={`${name}[${index}]`}
                    register={register}
                    control={control}
                  />
                  <Button onClick={() => remove(index)}>
                    Remove
                    {' '}
                    {property.title}
                  </Button>
                </>
              ))}
              <Button onClick={() => append({ [name]: '' })}>
                Add
                {' '}
                {property.title}
              </Button>
            </React.Fragment>
          ))}
        </FieldArray>
      )
    }
    default: {
      throw new Error(`Unsupported type: ${property.type} (on field: ${name})`)
    }
  }
}

export default SchemaFieldUI
