import React from 'react'
import { compose, withProps } from 'recompose'
import {
  withStyles,
  Grid,
  Divider,
  Typography,
  List,
  ListItem,
  FormControlLabel,
  TextField,
  MenuItem,
  Switch,
} from '@material-ui/core'
import Loader from 'react-loader-advanced'
import gql from 'graphql-tag'

import withLiveData from '../../shared/higherOrderComponents/withLiveData'


const CONFIG_SUBSCRIPTION = gql`
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

const styles = theme => ({
  title: {
    paddingTop: theme.spacing.unit * 3,
  },
  fieldsGrid: {
    padding: theme.spacing.unit * 2,
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

const MaterialConfigForm = ({ classes, material }) => (
  <main>
    <Grid container className={classes.fieldsGrid}>
      <Grid item xs={12}>
        <TextField
          required
          label="ID"
          margin="normal"
          fullWidth
        />
        <TextField
          required
          label="Target Extruder Temperature"
          margin="normal"
          fullWidth
        />
        <TextField
          required
          label="Target Bed Temperature"
          margin="normal"
          fullWidth
        />
      </Grid>
    </Grid>
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  MaterialConfigForm,
)
export default enhance(MaterialConfigForm)
