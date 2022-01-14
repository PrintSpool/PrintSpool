import React from 'react'
import { Link } from 'react-router-dom'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Fab from '@mui/material/Fab'
import Avatar from '@mui/material/Avatar'

import Add from '@mui/icons-material/Add'

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
  updateMutation,
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
            updateMutation={updateMutation}
            variables={{ inviteID }}
            query={gql`
              query($inviteID: ID) {
                invites(input: { inviteID: $inviteID }) {
                  configForm {
                    ...ConfigFormFragment
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
                    <Avatar>
                      {invite.description[0]}
                    </Avatar>
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
