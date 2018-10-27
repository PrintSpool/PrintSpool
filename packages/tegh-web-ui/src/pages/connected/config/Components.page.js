import React from 'react'
import { compose, withProps } from 'recompose'
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
  Usb,
  Toys,
  DeveloperBoard,
  VideoLabel,
  KeyboardArrowDown,
  Widgets,
  Waves,
  Add,
} from '@material-ui/icons'

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

const peripheralsOfType = (config, ofType) => (
  Object.entries(config.machine.components)
    .filter(([k, peripheral]) => peripheral.type === ofType)
)

const CATEGORIES = [
  {
    type: 'SERIAL_CONTROLLER',
    heading: 'Controllers',
    singularName: 'Controller',
    Icon: Usb,
  },
  {
    type: 'EXTRUDER',
    heading: 'Extruders',
    singularName: 'Extruder',
    Icon: Waves,
  },
  {
    type: 'HEATED_BED',
    heading: 'Heated Beds',
    singularName: 'Heated Bed',
    Icon: VideoLabel,
  },
  {
    type: 'FAN',
    heading: 'Fans',
    singularName: 'Fan',
    Icon: Toys,
  },
]

const ComponentsConfigPage = ({ classes, config }) => (
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
        CATEGORIES.map(({ type, heading, singularName, Icon }) => (
          <div>
            <ListSubheader>
              {heading}
            </ListSubheader>
            {
              peripheralsOfType(config, type).map(([k, peripheral]) => (
                <ListItem button key={k}>
                  <ListItemIcon>
                    {
                      (
                        Icon && <Icon />
                      )
                      || <Widgets />
                    }
                  </ListItemIcon>
                  <ListItemText>
                    {peripheral.name}
                  </ListItemText>
                </ListItem>
              ))
            }
            <Divider />
          </div>
        ))
      }
    </List>
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  ComponentsConfigPage,
)
export default enhance(ComponentsConfigPage)
