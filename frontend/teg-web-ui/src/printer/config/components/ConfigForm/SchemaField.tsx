import React from 'react'
import { useFieldArray, Controller } from 'react-hook-form'

import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Hidden from '@mui/material/Hidden'
import Switch from '@mui/material/Switch'
import TextField, { StandardTextFieldProps } from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Divider from '@mui/material/Divider'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

// import Typeahead from '../../../../common/Typeahead'

const SchemaField = ({
  showLabel = true,
  dense = false,
  schema,
  name,
  defaultValue: defaultValueOverride = null,
  property: propertyNoRefs,
  register,
  control,
  errors,
}) => {
  const fieldPath = `model.${name}`
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
    'pauseHook',
    'resumeHook',
  ]

  const multiline = gcodeHooks.includes(name)
  // console.log({ name, multiline })

  const isEnum = property.enum != null || property.oneOf != null

  let type = property.type
  if (typeof type == 'object') {
    type = type[0]
  }

  const error = errors[fieldPath]
  const helperText = error?.message || error || property.description
  const defaultValue = defaultValueOverride?.toString() || property.default?.toString() || ''

  switch (type) {
    case 'number':
    case 'integer':
    case 'string': {
      const componentType = type === 'string' ? 'text' : 'number'
      // console.log({ name, defaultValue, property })

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
        helperText,
        inputRef: register,
        name: fieldPath,
        label: showLabel ? property.title : null,
        margin: dense ? 'dense' : 'normal',
        variant: 'standard',
      }

      if (isEnum) {
        return (
          <Controller
            defaultValue={defaultValue}
            render={({ ref, name, value, onChange, onBlur }) => (
              <TextField
                {...textFieldProps}
                inputRef={ref}
                // @ts-ignore
                onChange={e => onChange(e.target.value)}
                onBlur={onBlur}
                name={name}
                value={(value === '' || value == null) ? defaultValue : value}
                select
              >
                {/* @ts-ignore */}
                { (property.enum || property.oneOf || [])[0] === '' && name === 'model.source' && (
                  <MenuItem value="test">
                    No Video Source detected.
                    <Hidden mdDown>
                      {' '}
                      Please connect your webcam or enable the raspberry pi camera
                    </Hidden>
                  </MenuItem>
                )}
                {/* @ts-ignore */}
                { (property.enum || property.oneOf)?.length === 0 && name === 'serialPortID' && (
                  <MenuItem value="">
                    No serial devices detected.
                    <Hidden mdDown>
                      {' '}
                      Please attach your 3D printer's USB cable.
                    </Hidden>
                  </MenuItem>
                )}
                { property.oneOf?.map((option) => (
                  <MenuItem key={option.const} value={option.const}>
                    {option.title}
                  </MenuItem>
                ))}
                {
                  property.enum
                    // An empty option is required for the schema validation
                    ?.filter(option => option !== '')
                    .map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))
                }
              </TextField>
            )}
            name={fieldPath}
            control={control}
          />
        );
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
          style={{
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          <Controller
            name={fieldPath}
            control={control}
            defaultValue={false}
            render={({ ref, name, value, onChange, onBlur }) => (
              <FormControlLabel
                label={showLabel ? property.title : ''}
                control={(
                  <Switch
                    {...{
                      margin: dense ? 'dense' : 'normal',
                      disabled: property.readOnly,
                    }}
                    size="small"
                    inputRef={ref}
                    // @ts-ignore
                    onChange={(e) => onChange(e.target.checked)}
                    checked={value || false}
                    onBlur={onBlur}
                    name={name}
                  />
                )}
              />
            )}
          />
          { helperText && helperText.length > 0 && (
            <FormHelperText
              error={ error != null}
            >
              {helperText}
            </FormHelperText>
          )}
        </div>
      )
    }
    case 'array': {
      const { fields, append, remove } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: fieldPath, // unique name for your Field Array
        // keyName: "id", default to "id", you can change the key name
      })
      // console.log({ name, fieldPath, fields })

      return <>
        {/* <Divider style={{
          marginTop: 16,
          marginBottom: 24,
        }} /> */}
        <Typography variant="body2" style={{
          marginTop: 16,
        }}>
          {property.title}
        </Typography>
        { property.description && (
          <Typography variant="subtitle1">
            {property.description}
          </Typography>
        )}
        {fields.length === 0 && (
          <Typography variant="body1" style={{
            marginTop: 16,
            marginBottom: 16,
            color: '#999',
            textAlign: 'center',
          }}>
            {`No ${property.title}`}
          </Typography>
        )}
        {fields.map((field, index) => (
          <div
            key={field.id}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignContent: 'center',
            }}
          >
            <SchemaField
              showLabel={false}
              dense
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
            <IconButton onClick={() => remove(index)} size="large">
              <DeleteIcon/>
            </IconButton>
          </div>
        ))}
        <Button
          startIcon={<AddIcon/>}
          variant="outlined"
          size="small"
          onClick={() => append({ value: '' })}
          style={{
            marginBottom: 16,
          }}
        >
          Add
        </Button>
        {/* <Divider style={{
          marginTop: 24,
          marginBottom: 16,
        }} /> */}
      </>;
    }
    default: {
      throw new Error(`Unsupported type: ${property.type} (on field: ${name})`)
    }
  }
}

export default SchemaField
