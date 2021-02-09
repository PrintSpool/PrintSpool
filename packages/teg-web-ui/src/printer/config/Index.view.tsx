import React from 'react'
import { Link } from 'react-router-dom'
import { gql } from '@apollo/client'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from './components/UpdateDialog/UpdateDialog.page'
import transformComponentSchema from './printerComponents/transformComponentSchema'

const ConfigView = ({
  machineID,
  machineDialogOpen = false,
  serverVersion,
  // hasPendingUpdates,
  devices,
  machines,
  loading,
  machineDefSuggestions,
  loadingMachineDefs,
}) => (
  <main style={{ overflowY: 'scroll' }}>
    {
      machineDialogOpen && !loading && !loadingMachineDefs && (
        <UpdateDialog
          title="3D Printer"
          collection="MACHINE"
          open={machineDialogOpen}
          variables={{ machineID }}
          status={machines[0].status}
          // hasPendingUpdates={hasPendingUpdates}
          hasPendingUpdates={false}
          transformSchema={schema => transformComponentSchema({
            schema,
            materials: [],
            devices,
            machineDefSuggestions,
          })}
          query={gql`
            query($machineID: ID) {
              machines(input: { id: $machineID }) {
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
          primary={serverVersion}
          // secondary={
          //   (
          //     hasPendingUpdates
          //     && 'Updates Pending. Please empty job queue to auto-update.'
          //   )
          //   || 'Teg is up to date and running the latest version available.'
          // }
        />
      </ListItem>
      <ListItem
        button
        component={React.forwardRef((props, ref) => (
          <Link to="machine/" innerRef={ref} {...props}>
            <ListItemText primary="3D Printer" />
          </Link>
        ))}
      />
      <ListItem
        button
        component={React.forwardRef((props, ref) => (
          <Link to="components/" innerRef={ref} {...props}>
            <ListItemText primary="Components" />
          </Link>
        ))}
      />
      <ListItem
        button
        component={React.forwardRef((props, ref) => (
          <Link to="materials/" innerRef={ref} {...props}>
            <ListItemText primary="Materials" />
          </Link>
        ))}
      />
      <ListItem
        button
        component={React.forwardRef((props, ref) => (
          <Link to="users/" innerRef={ref} {...props}>
            <ListItemText primary="Users" />
          </Link>
        ))}
      />
      <ListItem
        button
        component={React.forwardRef((props, ref) => (
          <Link to="invites/" innerRef={ref} {...props}>
            <ListItemText primary="Invite Keys" />
          </Link>
        ))}
      />
    </List>
  </main>
)

export default ConfigView
