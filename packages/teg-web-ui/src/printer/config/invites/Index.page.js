import React from 'react'
import { Link } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import Widgets from '@material-ui/icons/Widgets'
import Add from '@material-ui/icons/Add'

import { useQuery } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/Index'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import CreateInviteDialog from './create/CreateInviteDialog'
import Loading from '../../../common/Loading'

const InvitesQuery = gql`
  query InvitesQuery {
    hasPendingUpdates
    invites {
      id
      createdAt
      isAdmin
    }
  }
`

const useStyles = makeStyles(theme => ({
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

const enhance = Component => (props) => {
  const { match } = props
  // InvitesQuery
  const { inviteID, verb } = match.params

  const { data, loading, error } = useQuery(InvitesQuery, {
    pollInterval: 1000,
  })

  if (loading) {
    return <Loading />
  }

  if (error) {
    throw new Error(JSON.stringify(error))
  }

  const { invites } = data

  const nextProps = {
    ...props,
    selectedInvite: invites.find(c => c.id === inviteID),
    invites,
    inviteID,
    verb,
  }

  return (
    <Component {...nextProps} />
  )
}

const ComponentsConfigIndex = ({
  invites,
  inviteID,
  selectedInvite,
  verb,
  hasPendingUpdates,
}) => {
  const classes = useStyles()

  return (
    <main>
      { inviteID !== 'new' && selectedInvite != null && verb == null && (
        <UpdateDialog
          title={`Invite (ID: ${selectedInvite.id})`}
          open={selectedInvite != null}
          deleteButton
          collection="AUTH"
          status="READY"
          hasPendingUpdates={hasPendingUpdates}
          query={gql`
            query() {
              invitesConfigForm {
                ...UpdateDialogFragment
              }
            }
            ${UPDATE_DIALOG_FRAGMENT}
          `}
        />
      )}
      { selectedInvite != null && verb === 'delete' && (
        <DeleteConfirmationDialog
          type="invite"
          title="Invite"
          id={selectedInvite.id}
          collection="AUTH"
          open={selectedInvite != null}
        />
      )}
      <CreateInviteDialog
        open={inviteID === 'new'}
      />
      <Tooltip title="Create an Invite Code" placement="left">
        <Fab
          disabled={hasPendingUpdates}
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
                <Widgets />
              </ListItemIcon>
              <ListItemText>
                Invite (ID:
                {' '}
                {invite.id}
                )
              </ListItemText>
            </ListItem>
          ))
        }
      </List>
    </main>
  )
}

export const Component = ComponentsConfigIndex
export default enhance(ComponentsConfigIndex)
