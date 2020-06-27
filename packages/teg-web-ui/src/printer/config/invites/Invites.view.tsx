import React from 'react'
import { Link } from 'react-router-dom'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'
import Fab from '@material-ui/core/Fab'

import { makeStyles } from '@material-ui/core/styles'

import PersonOutline from '@material-ui/icons/PersonOutline'
import Add from '@material-ui/icons/Add'

import gql from 'graphql-tag'

import UpdateDialog from '../components/UpdateDialog/Index'
import CreateInviteDialog from './create/CreateInviteDialog'

const useStyles = makeStyles(theme => ({
  root: {
    overflowY: 'scroll',
  },
  title: {
    paddingTop: theme.spacing(3),
  },
  addFab: {
    position: 'fixed',
    zIndex: 10,
    bottom: theme.spacing(4),
    right: theme.spacing(2),
  },
}))

const InvitesView = ({
  invites,
  inviteID,
  selectedInvite,
  verb,
  hasPendingUpdates,
  onUpdate,
}) => {
  const classes = useStyles()

  return (
    <main className={classes.root}>
      { inviteID !== 'new' && selectedInvite != null && verb == null && (
        <UpdateDialog
          title={`Invite #${selectedInvite.id}`}
          open={selectedInvite != null}
          deleteButton
          collection="AUTH"
          status="READY"
          hasPendingUpdates={hasPendingUpdates}
          query={gql`
            query {
              schemaForm(input: {
                collection: AUTH
                schemaFormKey: "invite"
              }) {
                id
                schema
                form
              }
            }
          `}
          getConfigForm={data => ({
            id: selectedInvite.id,
            modelVersion: 1,
            schemaForm: data.schemaForm,
            model: selectedInvite,
          })}
          onSubmit={onUpdate}
        />
      )}
      { inviteID === 'new' && (
        <CreateInviteDialog open />
      )}
      <Tooltip title="Create an Invite Code" placement="left">
        <Fab
          disabled={hasPendingUpdates}
          component={React.forwardRef((props, ref) => (
            <Link
              to={inviteID === 'new' ? './' : 'new/'}
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
          invites.map(invite => (
            <ListItem
              button
              divider
              key={invite.id}
              component={React.forwardRef((props, ref) => (
                <Link to={`${invite.id}/`} innerRef={ref} {...props} />
              ))}
            >
              <ListItemIcon>
                <PersonOutline />
              </ListItemIcon>
              <ListItemText>
                Invite #
                {invite.id}
              </ListItemText>
            </ListItem>
          ))
        }
      </List>
    </main>
  )
}

export default InvitesView
