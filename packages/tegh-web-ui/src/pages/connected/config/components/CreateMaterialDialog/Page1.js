import React from 'react'
import { Field } from 'formik'
import { TextField } from 'formik-material-ui'
import {
  MenuItem,
} from '@material-ui/core'

import materialTypeNames from './materialTypeNames'

const Page1 = () => (
  <Field
    type="text"
    name="materialType"
    label="Please select a type for the material"
    select
    component={TextField}
    margin="normal"
    fullWidth
  >
    {materialTypeNames.map(option => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </Field>
)

export default Page1
