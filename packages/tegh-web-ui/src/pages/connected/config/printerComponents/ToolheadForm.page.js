import React from 'react'
import { compose } from 'recompose'
import { Field } from 'redux-form'
import {
  List,
  ListItem,
  FormControlLabel,
  MenuItem,
} from '@material-ui/core'
import {
  TextField,
  Switch,
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

const ToolheadForm = () => (
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
      label="Feedrate"
      name="feedrate"
      fullWidth
      margin="normal"
    />
    <Field
      component={TextField}
      label="Material"
      name="materialID"
      select
      fullWidth
      margin="normal"
    >
      {['generic/abs', 'generic/pla'].map(option => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Field>
    <List>
      <ListItem>
        <FormControlLabel
          label="Heated Extruder"
          control={(
            <Field
              component={Switch}
              name="heater"
            />
          )}
        />
      </ListItem>
    </List>
  </main>
)

export const Component = ToolheadForm
export default enhance(ToolheadForm)
