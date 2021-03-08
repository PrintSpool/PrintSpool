import React from 'react'
import { useFieldArray, Controller } from 'react-hook-form'
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
  defaultValue = null,
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

  // console.log({ name })
  // Get the common material ui props from the schema property
  const sharedFieldProps = {
    inputRef: register,
    name,
    defaultValue,
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

  const error = errors[name]

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

      if (isEnum) {
        return (
          <Controller
            as={
              <TextField
                {...sharedFieldProps}
                error={error != null}
                helperText={error?.message || error}
                select
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
            }
            name={name}
            control={control}
          />
        )
      }

      return (
        <TextField
          {...sharedFieldProps}
          error={error != null}
          helperText={error?.message || error}
          multiline={multiline}
          rows={multiline ? 5 : null}
          type={componentType}
          fullWidth
        />
      )
    }
    case 'boolean': {
      return (
        <div
          style={{ marginTop: 24 }}
        >
          <Controller
            name={name}
            control={control}
            render={(props) => (
              <FormControlLabel
                label={console.log(props) || property.title}
                control={(
                  <Switch
                    {...{
                      margin: 'normal',
                      disabled: property.readOnly,
                    }}
                    onChange={(e) => props.onChange(e.target.checked)}
                    checked={props.value || false}
                  />
                )}
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
      // console.log({ fields })

      return (
        <>
          <Typography varaint="body1">
            {property.title}
          </Typography>
          { property.description && (
            <Typography varaint="body2">
              {property.description}
            </Typography>
          )}
          {fields.map((field, index) => (
            <div key={field.id}>
              <SchemaFieldUI
                property={{
                  title: `${property.title} #${index + 1}`,
                  ...property.items,
                }}
                name={`${name}[${index}].value`}
                defaultValue={field.value}
                register={register}
                control={control}
                errors={errors}
              />
              <Button onClick={() => remove(index)}>
                {`Remove ${property.title} #${index + 1}`}
              </Button>
            </div>
          ))}
          <Button onClick={() => append({ [name]: '' })}>
            Add
            {' '}
            {property.title}
          </Button>
        </>
      )
    }
    default: {
      throw new Error(`Unsupported type: ${property.type} (on field: ${name})`)
    }
  }
}

export default SchemaFieldUI
