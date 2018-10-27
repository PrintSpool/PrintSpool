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

const ExtruderConfigPage = ({ classes, heater }) => (
  <main>
    <Grid container className={classes.fieldsGrid}>
      <Grid item xs={12}>
        <TextField
          required
          label="Name"
          margin="normal"
          fullWidth
        />
        <TextField
          required
          label="Feedrate"
          margin="normal"
          fullWidth
        />
        <TextField
          required
          select
          label="Material"
          margin="normal"
          fullWidth
        >
          {['PLA', 'ABS'].map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
    <List>
      <ListItem>
        <FormControlLabel
          label="Heated Extruder"
          control={
            <Switch />
          }
        />
      </ListItem>
    </List>
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  ExtruderConfigPage,
)
export default enhance(ExtruderConfigPage)
