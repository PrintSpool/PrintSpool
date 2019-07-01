import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'

import {
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from './components/UpdateDialog/Index'

import withLiveData from '../common/higherOrderComponents/withLiveData'

import transformComponentSchema from './printerComponents/transformComponentSchema'
import useMachineDefSuggestions from '../../common/_hooks/useMachineDefSuggestions'

const DEVICES_SUBSCRIPTION = gql`
  subscription DevicesSubscription {
    live {
      patch { op, path, from, value }
      query {
        teghVersion
        hasPendingUpdates
        devices {
          id
          type
        }
        machines {
          id
          status
        }
      }
    }
  }
`

const enhance = compose(
  withRouter,
  withProps(({ match }) => ({
    machineID: match.params.machineID,
    machineDialogOpen: match.path === '/m/:hostID/:machineID/config/machine/',
    subscription: DEVICES_SUBSCRIPTION,
  })),
  withLiveData,
  Component => (props) => {
    const {
      suggestions: machineDefSuggestions,
      loading: loadingMachineDefs,
    } = useMachineDefSuggestions()

    const nextProps = {
      ...props,
      machineDefSuggestions,
      loadingMachineDefs,
    }

    return (
      <Component {...nextProps} />
    )
  },
)

const ConfigPage = ({
  machineID,
  machineDialogOpen = false,
  teghVersion,
  hasPendingUpdates,
  devices,
  machines,
  loading,
  machineDefSuggestions,
  loadingMachineDefs,
}) => (
  <main>
    {
      machineDialogOpen && !loading && !loadingMachineDefs && (
        <UpdateDialog
          title="3D Printer"
          collection="MACHINE"
          open={machineDialogOpen}
          variables={{ machineID }}
          status={machines[0].status}
          hasPendingUpdates={hasPendingUpdates}
          transformSchema={schema => transformComponentSchema({
            schema,
            materials: [],
            devices,
            machineDefSuggestions,
          })}
          query={gql`
            query($machineID: ID!) {
              machines(machineID: $machineID) {
                configForm {
                  ...UpdateDialogFragment
                }
              }
            }
            ${UPDATE_DIALOG_FRAGMENT}
          `}
        />
      )
    }
    <List component="nav">
      <ListItem divider>
        <ListItemText
          primary={`Teg v${teghVersion}`}
          secondary={
            (
              hasPendingUpdates
              && 'Updates Pending. Please empty job queue to auto-update.'
            )
            || 'Teg is up to date and running the latest version available.'
          }
        />
      </ListItem>
      <ListItem
        button
        component={React.forwardRef((props, ref) => (
          <Link to="machine/" innerRef={ref} {...props} />
        ))}
      >
        <ListItemText primary="3D Printer" />
      </ListItem>
      <ListItem
        button
        component={React.forwardRef((props, ref) => (
          <Link to="components/" innerRef={ref} {...props} />
        ))}
      >
        <ListItemText primary="Components" />
      </ListItem>
      <ListItem
        button
        component={React.forwardRef((props, ref) => (
          <Link to="plugins/" innerRef={ref} {...props} />
        ))}
      >
        <ListItemText primary="Plugins" />
      </ListItem>
      <ListItem
        button
        component={React.forwardRef((props, ref) => (
          <Link to="materials/" innerRef={ref} {...props} />
        ))}
      >
        <ListItemText primary="Materials" />
      </ListItem>
    </List>
  </main>
)

export const Component = ConfigPage
export default enhance(ConfigPage)
