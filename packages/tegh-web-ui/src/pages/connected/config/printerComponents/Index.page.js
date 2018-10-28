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
  Usb,
  Toys,
  VideoLabel,
  Widgets,
  Waves,
  Add,
} from '@material-ui/icons'

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

const componentsOfType = (config, ofType) => (
  config.components
    .filter(component => component.type === ofType)
)

const CATEGORIES = [
  {
    type: 'CONTROLLER',
    heading: 'Controllers',
    slug: 'controllers',
    Icon: Usb,
  },
  {
    type: 'TOOLHEAD',
    heading: 'Toolheads',
    slug: 'toolheads',
    Icon: Waves,
  },
  {
    type: 'BUILD_PLATFORM',
    heading: 'Build Platform',
    slug: 'build-platforms',
    Icon: VideoLabel,
  },
  {
    type: 'FAN',
    heading: 'Fans',
    slug: 'fans',
    Icon: Toys,
  },
]

const ComponentsConfigIndex = ({ classes, config }) => (
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
        CATEGORIES.map(({
          type,
          heading,
          slug,
          Icon,
        }) => (
          <div key={type}>
            <ListSubheader>
              {heading}
            </ListSubheader>
            {
              componentsOfType(config, type).map(peripheral => (
                <ListItem
                  button
                  divider
                  key={peripheral.id}
                  component={props => (
                    <Link to={`${slug}/${peripheral.id}/`} {...props} />
                  )}
                >

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
  ComponentsConfigIndex,
)
export default enhance(ComponentsConfigIndex)
