import React from 'react'
import { compose } from 'recompose'
import { Field } from 'redux-form'
import {
  List,
  ListItem,
  FormControlLabel,
  MenuItem,
  Switch,
} from '@material-ui/core'
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

const ControllerForm = ({ classes, initialValues }) => (
  <main>
    <Field
      component={TextField}
      label="Name"
      name="name"
      fullWidth
      margin="normal"
    />
    <Field
      component={TextField}
      label="Serial Port"
      name="serialPortID"
      select
      fullWidth
      margin="normal"
    >
      {
        [initialValues.serialPortID, 'Arduino_1', 'Arduino_2'].map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))
      }
    </Field>
    <Field
      component={TextField}
      label="Baud Rate"
      name="baudRate"
      select
      fullWidth
      margin="normal"
    >
      {
        [9200, 250000].map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))
      }
    </Field>

    <List>
      <ListItem>
        <FormControlLabel
          label="Simulate Attached Controller"
          control={
            <Switch />
          }
        />
      </ListItem>
    </List>

  </main>
)

export const Component = ControllerForm
export default enhance(ControllerForm)
