import React from 'react'
import { compose } from 'recompose'
import { Field } from 'redux-form'
import {
  List,
  ListItem,
  FormControlLabel,
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

const BuildPlatformForm = () => (
  <main>
    <Field
      component={TextField}
      label="Name"
      name="name"
      fullWidth
      margin="normal"
    />
    <List>
      <ListItem>
        <FormControlLabel
          label="Heated Build Platform"
          control={
            <Switch />
          }
        />
      </ListItem>
    </List>
  </main>
)

export const Component = BuildPlatformForm
export default enhance(BuildPlatformForm)
