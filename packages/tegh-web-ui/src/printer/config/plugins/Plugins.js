import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import {
  withStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
} from '@material-ui/core'
import {
  Widgets,
  Add,
} from '@material-ui/icons'

import gql from 'graphql-tag'

import withLiveData from '../../common/higherOrderComponents/withLiveData'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/Index'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import CreatePluginDialog from './create/CreatePluginDialog'

const PLUGINS_SUBSCRIPTION = gql`
  subscription ConfigSubscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        hasPendingUpdates
        printers(printerID: $printerID) {
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
      printerID: ownProps.match.params.printerID,
    },
  })),
  withLiveData,
  withProps(({ printers, match }) => {
    const { pluginID, printerID, verb } = match.params
    const { plugins, availablePackages, status } = printers[0]

    return {
      selectedPlugin: plugins.find(c => c.id === pluginID),
      plugins,
      availablePackages,
      printerID,
      pluginID,
      verb,
      status,
    }
  }),
  withStyles(styles, { withTheme: true }),
)

const ComponentsConfigIndex = ({
  classes,
  printerID,
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
        variables={{ printerID, package: selectedPlugin.package }}
        status={status}
        hasPendingUpdates={hasPendingUpdates}
        query={gql`
          query($printerID: ID!, $package: String) {
            printers(printerID: $printerID) {
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
        printerID={printerID}
        open={selectedPlugin != null}
      />
    )}
    <CreatePluginDialog
      printerID={printerID}
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
