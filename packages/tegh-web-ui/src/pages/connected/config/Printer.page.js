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
} from '@material-ui/core'
import Loader from 'react-loader-advanced'
import gql from 'graphql-tag'

import withLiveData from '../shared/higherOrderComponents/withLiveData'

import PrinterStatusGraphQL from '../shared/PrinterStatus.graphql'

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
  withProps(ownProps => ({
    subscription: CONFIG_SUBSCRIPTION,
    variables: {
      printerID: ownProps.match.params.printerID,
    },
  })),
  withLiveData,
  withProps(({ singularPrinter }) => ({
    printer: singularPrinter[0],
  })),
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
    { console.log(classes.title) }
    <Typography variant="h5" classes={{ root: classes.title }}>
      Controllers
    </Typography>
    <List>
      <ListItem button>
        <div>
          <Typography variant="h6">Serial Controller Board</Typography>
        </div>
      </ListItem>
    </List>


    <TextField
      required
      label="Name"
      margin="normal"
      fullWidth
    />

  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  PrinterConfigPage,
)
export default enhance(PrinterConfigPage)
