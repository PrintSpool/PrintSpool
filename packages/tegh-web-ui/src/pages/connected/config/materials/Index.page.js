import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import {
  withStyles,
  Grid,
  Divider,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
  MenuItem,
  Tooltip,
  Button,
} from '@material-ui/core'
import {
  Style,
  Add,
} from '@material-ui/icons'

import Loader from 'react-loader-advanced'
import gql from 'graphql-tag'

import withLiveData from '../../shared/higherOrderComponents/withLiveData'

import PrinterStatusGraphQL from '../../shared/PrinterStatus.graphql.js'

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
  addFab: {
    position: 'fixed',
    bottom: theme.spacing.unit * 4,
    right: theme.spacing.unit * 2,
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

const MaterialsConfigIndex = ({ classes, materials }) => (
  <main>
    <Tooltip title="Add Component" placement="left">
      <Button
        component="label"
        variant="fab"
        className={classes.addFab}
      >
        <Add />
      </Button>
    </Tooltip>
    <List>
      {
        materials.map(material => (
          <ListItem
            button
            divider
            key={material.id}
            component={props => <Link to={`${material.id}/`} {...props} />}
          >
            <ListItemIcon>
              <Style />
            </ListItemIcon>
            <ListItemText
              primary={material.id}
              secondary={`${material.targetTemperature}°`}
            />
          </ListItem>
        ))
      }
    </List>
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  MaterialsConfigIndex,
)
export default enhance(MaterialsConfigIndex)
