import React from 'react'
import { compose, withProps } from 'recompose'
import {
  withStyles,
  Grid,
  Divider,
  Typography,
  List,
  ListItem,
  TextField,
  MenuItem,
  ListItemText,
  ListSubheader,
  Dialog,
  Paper,
} from '@material-ui/core'
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
  withProps(ownProps => ({
    form: `config/Printer/${ownProps.printerID}`,
    
  })),
  reduxForm(),
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
    <TextField
      required
      label="Name"
      margin="normal"
      fullWidth
    />
    <TextField
      required
      select
      label="Make and model"
      margin="normal"
      fullWidth
    >
      {['Lulzbot Mini 1', 'Lulzbot Mini 2'].map(option => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
    {
      config.machine.axes.map((axis, index) => (
        <TextField
          key={axis.id}
          required
          label={`${axis.id.toUpperCase()} Feedrate`}
          margin="normal"
          fullWidth
        />
      ))
    }
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  PrinterConfigPage,
)
export default enhance(PrinterConfigPage)
