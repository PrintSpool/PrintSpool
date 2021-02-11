import React from 'react'
import { Link } from 'react-router-dom'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'
import Fab from '@material-ui/core/Fab'

import PersonOutline from '@material-ui/icons/PersonOutline'
import Add from '@material-ui/icons/Add'

import { gql } from '@apollo/client'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'
import CreateInviteDialog from './create/CreateInviteDialog.page'
import useStyles from './Invites.styles'

const InvitesConfigView = ({
  inviteID,
  verb,
  invite,
  invites,
  hasPendingUpdates,
  update,
}) => {
  const classes = useStyles()

  return (
    <main className={classes.root}>
      {
        inviteID != null && verb == null && (
          <UpdateDialog
            title={invite.description}
            open
            deleteButton
            status={'READY'}
            hasPendingUpdates={hasPendingUpdates}
            onSubmit={update}
            variables={{ inviteID }}
            query={gql`
              query($inviteID: ID) {
                invites(input: { inviteID: $inviteID }) {
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
      { verb === 'new' && (
        <CreateInviteDialog open />
      )}
      <Tooltip title="Add Component" placement="left">
        <Fab
          disabled={hasPendingUpdates}
          component={React.forwardRef((props, ref) => (
            <Link
              to={verb === 'new' ? './' : 'new/'}
              innerRef={ref}
              style={{ textDecoration: 'none' }}
              {...props}
            />
          )) as any}
          className={classes.addFab}
        >
          <Add />
        </Fab>
      </Tooltip>
      <List>
        { invites.length === 0 && (
          <ListItem>
            <ListItemText secondary="No Invites Found." />
          </ListItem>
        )}
        {
          invites.map(invite => (
            <ListItem
              button
              divider
              key={invite.id}
              component={React.forwardRef((props, ref) => (
                <Link to={`${invite.id}/`} innerRef={ref} {...props}>
                  <ListItemIcon>
                    <PersonOutline />
                  </ListItemIcon>
                  <ListItemText>
                    {invite.description}
                  </ListItemText>
                </Link>
              ))}
            />
          ))
        }
      </List>
    </main>
  )
}

export default InvitesConfigView
