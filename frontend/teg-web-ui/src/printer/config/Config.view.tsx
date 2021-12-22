import React from 'react'
import { Link } from 'react-router-dom'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'

import UpdateDialogView from './components/UpdateDialog/UpdateDialog.view'
import ServerBreadcrumbs from '../common/ServerBreadcrumbs'

const ConfigView = ({
  serverVersion,
  machine,
  // hasPendingUpdates,
  updateDialogProps,
}) => {
  return (
    <main style={{ overflowY: 'scroll' }}>
      { updateDialogProps != null && (
        <UpdateDialogView {...updateDialogProps}/>
      )}

      <div style={{ marginTop: 16, marginLeft: 16, marginRight: 16}}>
        <ServerBreadcrumbs machineName={machine.name}>
          <Typography color="textPrimary">Settings</Typography>
        </ServerBreadcrumbs>
      </div>

      <List component="nav">
        <ListItem>
          <ListItemText
            primary={(
              <span>
                {'Server Version: '}
                <i>{serverVersion}</i>
              </span>
            )}
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
}

export default ConfigView
