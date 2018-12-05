import React from 'react'
import { Field } from 'formik'
import { TextField } from 'formik-material-ui'
import {
  MenuItem,
} from '@material-ui/core'

import componentTypeNames from './componentTypeNames'

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
    {componentTypeNames.map(option => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </Field>
)

export default Page1
