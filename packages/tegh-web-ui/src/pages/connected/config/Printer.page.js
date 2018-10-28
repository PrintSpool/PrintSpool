import React from 'react'
import { compose, withProps } from 'recompose'
import {
  withStyles,
  Grid,
  Divider,
  Typography,
  List,
  ListItem,
  MenuItem,
  ListItemText,
  ListSubheader,
  Dialog,
  Paper,
  InputAdornment,
} from '@material-ui/core'
import {
  TextField,
} from 'redux-form-material-ui'
import { Field, reduxForm } from 'redux-form'
import Loader from 'react-loader-advanced'
import gql from 'graphql-tag'

import withLiveData from '../shared/higherOrderComponents/withLiveData'

import PrinterStatusGraphQL from '../shared/PrinterStatus.graphql.js'

const CONFIG_SUBSCRIPTION = gql`
  subscription ConfigSubscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        printers {
          ...PrinterStatus
        }
      }
    }
  }

  # fragments
  ${PrinterStatusGraphQL}
`

const styles = theme => ({
  title: {
    paddingTop: theme.spacing.unit * 3,
  },
})

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  // withProps(ownProps => ({
  //   subscription: CONFIG_SUBSCRIPTION,
  //   variables: {
  //     printerID: ownProps.match.params.printerID,
  //   },
  // })),
  // withLiveData,
  // withProps(({ singularPrinter }) => ({
  //   printer: singularPrinter[0],
  // })),
)

const PrinterConfigPage = ({ classes, config }) => (
  <main>
    { console.log(config)}
    <Field
      component={TextField}
      label="Name"
      name="name"
      props={{
        required: true,
        margin: 'normal',
        fullWidth: true,
      }}
    />
    <Field
      component={TextField}
      label="Make and model"
      name="modelID"
      props={{
        select: true,
        required: true,
        margin: 'normal',
        fullWidth: true,
        children: [
          { id: 'lulzbot/lulzbot-mini-1', name: 'Lulzbot Mini 1' },
          { id: 'lulzbot/lulzbot-mini-2', name: 'Lulzbot Mini 2' },
        ].map(option => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        )),
      }}
    />
    {
      config.axes.map((axis, index) => (
        <Field
          key={axis.id}
          component={TextField}
          label={`${axis.name.toUpperCase()} Feedrate`}
          name={`axes[${index}].feedrate`}
          props={{
            required: true,
            margin: 'normal',
            fullWidth: true,
            InputProps: {
              endAdornment: (
                <InputAdornment variant="filled" position="end">
                  mm/s
                </InputAdornment>
              ),
            },
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
