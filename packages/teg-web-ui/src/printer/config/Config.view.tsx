import React from 'react'
import { Link } from 'react-router-dom'
import { gql } from '@apollo/client'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from './components/UpdateDialog/UpdateDialog.page'
import transformComponentSchema from './printerComponents/transformComponentSchema'
import { useValidate } from './components/FormikSchemaForm/withValidate'
import UpdateDialogView from './components/UpdateDialog/UpdateDialog.view'

const ConfigView = ({
  serverVersion,
  // hasPendingUpdates,
  updateDialogProps,
}) => {
  return (
    <main style={{ overflowY: 'scroll' }}>
      { updateDialogProps != null && (
        <UpdateDialogView {...updateDialogProps}/>
      )}
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
}

export default ConfigView
