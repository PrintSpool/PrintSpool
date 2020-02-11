import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useAsync } from 'react-async'

import PersonOutline from '@material-ui/icons/PersonOutline'
import Add from '@material-ui/icons/Add'

import { useQuery, useApolloClient } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import UpdateDialog from '../components/UpdateDialog/Index'
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

const updateInvite = gql`
  mutation updateInvite($input: UpdateInviteInput!) {
    updateInvite(input: $input) {
      errors {
        message
      }
    }
  }
`

const deleteInviteMutation = gql`
  mutation deleteInvite($input: DeleteInviteInput!) {
    deleteInvite(input: $input)
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

  const history = useHistory()
  const apollo = useApolloClient()

  const { data, loading, error } = useQuery(InvitesQuery, {
    pollInterval: 1000,
  })

  const { invites = [] } = data || {}
  const selectedInvite = invites.find(c => c.id === inviteID)

  const deleteInvite = useAsync({
    deferFn: async () => {
      await apollo.mutate({
        mutation: deleteInviteMutation,
        variables: {
          input: {
            inviteID: selectedInvite.id,
          },
        },
      })
      history.push('../')
    },
  })

  if (deleteInvite.error) {
    throw deleteInvite.error
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    throw new Error(JSON.stringify(error))
  }

  const onUpdate = async (model) => {
    console.log({ model })
    const { data: { errors } } = await apollo.mutate({
      mutation: updateInvite,
      variables: {
        input: {
          inviteID: selectedInvite.id,
          ...model,
        },
      },
    })
    if (errors) {
      throw new Error(JSON.stringify(errors))
    }
    history.push('../')
  }

  const nextProps = {
    ...props,
    selectedInvite,
    invites,
    inviteID,
    verb,
    onUpdate,
    deleteInvite,
  }

  return (
    <Component {...nextProps} />
  )
}

const InvitesConfigIndex = ({
  invites,
  inviteID,
  selectedInvite,
  verb,
  hasPendingUpdates,
  onUpdate,
  deleteInvite,
}) => {
  const classes = useStyles()

  return (
    <main>
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
      { selectedInvite != null && verb === 'delete' && (
        <DeleteConfirmationDialog
          type="invite"
          title="Invite"
          id={selectedInvite.id}
          collection="AUTH"
          open={selectedInvite != null}
          onDelete={deleteInvite.run}
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

export const Component = InvitesConfigIndex
export default enhance(InvitesConfigIndex)
