import React from 'react'
import { compose } from 'recompose'
import {
  withStyles,
  MenuItem,
  InputAdornment,
} from '@material-ui/core'
import {
  TextField,
} from 'redux-form-material-ui'
import { Field } from 'redux-form'
import gql from 'graphql-tag'

export const CONFIG_SUBSCRIPTION = gql`
  subscription ConfigSubscriptio1n($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        printers {
          id
        }
      }
    }
  }

  # fragments
`

const styles = theme => ({
  title: {
    paddingTop: theme.spacing.unit * 3,
  },
})

const enhance = compose(
  withStyles(styles, { withTheme: true }),
)

const PrinterConfigPage = ({ initialValues }) => (
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
      label="Make and model"
      name="modelID"
      select
      fullWidth
      margin="normal"
    >
      {
        [
          { id: 'lulzbot/lulzbot-mini-1', name: 'Lulzbot Mini 1' },
          { id: 'lulzbot/lulzbot-mini-2', name: 'Lulzbot Mini 2' },
        ].map(option => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))
      }
    </Field>
    {
      initialValues.axes.map((axis, index) => (
        <Field
          key={axis.id}
          component={TextField}
          label={`${axis.name.toUpperCase()} Feedrate`}
          name={`axes[${index}].feedrate`}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment variant="filled" position="end">
                mm/s
              </InputAdornment>
            ),
          }}
        />
      ))
    }
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  PrinterConfigPage,
)
export default enhance(PrinterConfigPage)
