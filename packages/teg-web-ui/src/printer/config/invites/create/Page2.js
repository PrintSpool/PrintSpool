import React from 'react'
import { Field } from 'formik'
import { TextField } from 'formik-material-ui'
import {
  MenuItem,
} from '@material-ui/core'

const Page1 = ({
  availablePackages,
}) => (
  <Field
    type="text"
    name="package"
    label="Please select the type of the component"
    select
    component={TextField}
    margin="normal"
    fullWidth
  >
    { availablePackages.map(packageName => (
      <MenuItem key={packageName} value={packageName}>
        {packageName}
      </MenuItem>
    )) }
  </Field>
)

export default Page1
