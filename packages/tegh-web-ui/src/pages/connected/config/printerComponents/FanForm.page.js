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

const FanForm = () => (
  <main>
    <Field
      component={TextField}
      label="Name"
      name="name"
      fullWidth
      margin="normal"
    />
  </main>
)

export const Component = FanForm
export default enhance(FanForm)
