import React from 'react'
import { compose } from 'recompose'
import { Field } from 'redux-form'
import {
  withStyles,
  FormControlLabel,
  MenuItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  Grid,
} from '@material-ui/core'
import {
  ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons'
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
  withStyles(theme => ({
    advancedPanel: {
      marginTop: theme.typography.pxToRem(15),
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  })),
)

const validateJSON = (value) => {
  try {
    JSON.parse(value)
  } catch (e) {
    return `Invalid JSON Syntax: ${e.message}`
  }
}

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

    <ExpansionPanel className={classes.advancedPanel} elevation={1}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography className={classes.heading}>Advanced</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container>
          <Grid item xs={12}>
            <FormControlLabel
              label="Simulate Attached Controller"
              control={(
                <Field
                  component={Switch}
                  name="simulate"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              component={TextField}
              label="Extended Configuration"
              name="extendedConfig"
              format={(value) => {
                if (typeof value === 'string') {
                  return value
                }
                return JSON.stringify(value, null, 2)
              }}
              validate={validateJSON}
              margin="normal"
              fullWidth
              multiline
            />
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  </main>
)

export const Component = ControllerForm
export default enhance(ControllerForm)
