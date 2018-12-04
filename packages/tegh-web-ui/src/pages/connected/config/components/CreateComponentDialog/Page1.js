import React from 'react'
import { Field } from 'formik'
import { TextField } from 'formik-material-ui'
import {
  MenuItem,
} from '@material-ui/core'

const COMPONENT_TYPES = [
  {
    value: 'CONTROLLER',
    label: 'Controller',
  },
  {
    value: 'AXIS',
    label: 'Axis',
  },
  {
    value: 'TOOLHEAD',
    label: 'Toolhead',
  },
  {
    value: 'BUILD_PLATFORM',
    label: 'Build Platform',
  },
  {
    value: 'FAN',
    label: 'Fan',
  },
]

const Page1 = () => (
  <Field
    type="text"
    name="componentType"
    label="Please select the type of the component"
    select
    component={TextField}
    margin="normal"
    fullWidth
  >
    {COMPONENT_TYPES.map(option => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </Field>
)

export default Page1
