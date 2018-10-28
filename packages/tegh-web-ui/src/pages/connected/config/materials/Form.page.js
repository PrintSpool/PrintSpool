import React from 'react'
import { compose } from 'recompose'
import { Field } from 'redux-form'
import {
  TextField,
} from 'redux-form-material-ui'
import gql from 'graphql-tag'


export const CONFIG_SUBSCRIPTION = gql`
  subscription ConfigSubscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        printers {
          id
        }
      }
    }
  }

`

const enhance = compose(
)

const MaterialConfigForm = () => (
  <main>
    <Field
      component={TextField}
      name="id"
      label="ID"
      margin="normal"
      fullWidth
    />
    <Field
      component={TextField}
      name="targetExtruderTemperature"
      label="Target Extruder Temperature"
      margin="normal"
      fullWidth
    />
    <Field
      component={TextField}
      name="targetBedTemperature"
      label="Target Bed Temperature"
      margin="normal"
      fullWidth
    />
  </main>
)

export const Component = MaterialConfigForm
export default enhance(MaterialConfigForm)
