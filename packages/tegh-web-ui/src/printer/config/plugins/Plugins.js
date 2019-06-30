import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
} from '@material-ui/core'
import {
  withStyles,
} from '@material-ui/styles'

import Widgets from '@material-ui/icons/Widgets'
import Add from '@material-ui/icons/Add'

import gql from 'graphql-tag'

import withLiveData from '../../common/higherOrderComponents/withLiveData'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/Index'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import CreatePluginDialog from './create/CreatePluginDialog'

const PLUGINS_SUBSCRIPTION = gql`
  subscription ConfigSubscription($machineID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        hasPendingUpdates
        machines(machineID: $machineID) {
          id
          status
          plugins {
            id
            package
            isEssential
          }
          availablePackages
        }
      }
    }
  }
`

const styles = theme => ({
  title: {
    paddingTop: theme.spacing(3),
  },
  addFab: {
    position: 'fixed',
    zIndex: 10,
    bottom: theme.spacing(4),
    right: theme.spacing(2),
  },
})

const enhance = compose(
  withProps(ownProps => ({
    subscription: PLUGINS_SUBSCRIPTION,
    variables: {
      machineID: ownProps.match.params.machineID,
    },
  })),
  withLiveData,
  withProps(({ machines, match }) => {
    const { pluginID, machineID, verb } = match.params
    const { plugins, availablePackages, status } = machines[0]

    return {
      selectedPlugin: plugins.find(c => c.id === pluginID),
      plugins,
      availablePackages,
      machineID,
      pluginID,
      verb,
      status,
    }
  }),
  withStyles(styles, { withTheme: true }),
)

const ComponentsConfigIndex = ({
  classes,
  machineID,
  plugins,
  pluginID,
  selectedPlugin,
  verb,
  availablePackages,
  status,
  hasPendingUpdates,
}) => (
  <main>
    { pluginID !== 'new' && selectedPlugin != null && verb == null && (
      <UpdateDialog
        title={selectedPlugin.package}
        open={selectedPlugin != null}
        deleteButton={selectedPlugin.isEssential === false}
        collection="PLUGIN"
        variables={{ machineID, package: selectedPlugin.package }}
        status={status}
        hasPendingUpdates={hasPendingUpdates}
        query={gql`
          query($machineID: ID!, $package: String) {
            machines(machineID: $machineID) {
              plugins(package: $package) {
                configForm {
                  ...UpdateDialogFragment
                }
              }
            }
          }
          ${UPDATE_DIALOG_FRAGMENT}
        `}
      />
    )}
    { selectedPlugin != null && verb === 'delete' && (
      <DeleteConfirmationDialog
        type={selectedPlugin.package}
        title={selectedPlugin.package}
        id={selectedPlugin.id}
        collection="PLUGIN"
        machineID={machineID}
        open={selectedPlugin != null}
      />
    )}
    <CreatePluginDialog
      machineID={machineID}
      open={pluginID === 'new'}
      availablePackages={availablePackages}
    />
    <Tooltip title="Add Plugin" placement="left">
      <Fab
        disabled={hasPendingUpdates || status === 'PRINTING'}
        component={React.forwardRef((props, ref) => (
          <Link
            to="new/"
            innerRef={ref}
            style={{ textDecoration: 'none' }}
            {...props}
          />
        ))}
        className={classes.addFab}
      >
        <Add />
      </Fab>
    </Tooltip>
    <List>
      {
        plugins.map(plugin => (
          <ListItem
            button
            divider
            key={plugin.id}
            component={React.forwardRef((props, ref) => (
              <Link to={`${plugin.id}/`} innerRef={ref} {...props} />
            ))}
          >
            <ListItemIcon>
              <Widgets />
            </ListItemIcon>
            <ListItemText>
              {plugin.package}
            </ListItemText>
          </ListItem>
        ))
      }
    </List>
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  ComponentsConfigIndex,
)
export default enhance(ComponentsConfigIndex)
