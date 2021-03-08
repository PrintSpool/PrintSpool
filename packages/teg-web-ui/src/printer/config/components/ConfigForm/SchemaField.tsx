import React from 'react'
import { useFieldArray, Controller } from 'react-hook-form'
import MenuItem from '@material-ui/core/MenuItem'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Hidden from '@material-ui/core/Hidden'
import Switch from '@material-ui/core/Switch'
import TextField, { StandardTextFieldProps } from '@material-ui/core/TextField'

// import Typeahead from '../../../../common/Typeahead'

const SchemaField = ({
  schema,
  name,
  defaultValue = null,
  property: propertyNoRefs,
  register,
  control,
  errors,
}) => {
  const fieldPath = `model[${name}]`
  // Apply schema refs to get the final schema property values
  if (propertyNoRefs == null) {
    throw new Error(`JSON schema missing type "${name}"`)
  }

  const refMixins = (propertyNoRefs.allOf || [])
    .map(r => schema.definitions[r['$ref'].replace('#/definitions/', '')] );

  refMixins.unshift({...propertyNoRefs})

  const property = refMixins.reduce((a, b) => ({ ...a, ...b }))

  // console.log({ name })

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

  const error = errors[fieldPath]

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

      // Get the common material ui props from the schema property
      const textFieldProps: StandardTextFieldProps = {
        key: name,
        defaultValue,
        disabled: property.readOnly,
        error: error != null,
        fullWidth: true,
        helperText: error?.message || error || property.description,
        inputRef: register,
        name: fieldPath,
        label: property.title,
        margin: 'normal',
        variant: 'standard',
      }

      if (isEnum) {
        return (
          <Controller
            as={
              <TextField
                {...textFieldProps}
                select
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
            name={fieldPath}
            control={control}
          />
        )
      }

      return (
        <TextField
          {...textFieldProps}
          multiline={multiline}
          rows={multiline ? 5 : null}
          type={componentType}
        />
      )
    }
    case 'boolean': {
      return (
        <div
          style={{ marginTop: 24 }}
        >
          <Controller
            name={fieldPath}
            control={control}
            render={(props) => (
              <FormControlLabel
                label={property.title}
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
        name: fieldPath, // unique name for your Field Array
        // keyName: "id", default to "id", you can change the key name
      })
      // console.log({ fields })

      return (
        <>
          <Typography variant="body1">
            {property.title}
          </Typography>
          { property.description && (
            <Typography variant="body2">
              {property.description}
            </Typography>
          )}
          {fields.map((field, index) => (
            <div key={field.id}>
              <SchemaField
                schema={schema.properties[name]}
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
          <Button onClick={() => append({ value: '' })}>
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

export default SchemaField
