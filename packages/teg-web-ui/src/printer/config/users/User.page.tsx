import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useAsync } from 'react-async'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { useQuery, useApolloClient } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import UpdateDialog from '../components/UpdateDialog/Index'
import { useDelete } from '../components/useDeleteConfig'
import Loading from '../../../common/Loading'

const usersQuery = gql`
  query usersQuery {
    hasPendingUpdates
    users {
      id
      email
      isAdmin
      picture
      createdAt
    }
  }
`

const updateUser = gql`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      errors {
        message
      }
    }
  }
`

const deleteUser = gql`
  mutation deleteUser($input: DeleteUserInput!) {
    deleteUser(input: $input)
  }
`

const useStyles = makeStyles(theme => ({
  updateTitleAvatar: {
    float: 'left',
    marginTop: '0.2em',
    marginRight: theme.spacing(1),
  },
  root: {
    overflowY: 'scroll',
  },
}), { useTheme: true })

const enhance = Component => (props) => {
  const { match } = props
  // UsersQuery
  const { userID, verb } = match.params

  const history = useHistory()
  const apollo = useApolloClient()
  const { data, loading, error } = useQuery(usersQuery, {
    pollInterval: 1000,
  })

  const { users = [] } = data || {}

  const selectedUser = users.find(c => c.id === userID)

  const deleteAction = useAsync({
    deferFn: async () => {
      await apollo.mutate({
        mutation: deleteUser,
        variables: {
          input: {
            userID: selectedUser.id,
          },
        },
      })
      history.push('../')
    },
  })

  if (deleteAction.error) {
    throw deleteAction.error
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    throw new Error(JSON.stringify(error))
  }

  if (userID != null && selectedUser == null) {
    return <div>Unable to load User</div>
  }

  const onUpdate = async (model) => {
    const { data: { errors } } = await apollo.mutate({
      mutation: updateUser,
      variables: {
        input: {
          userID: selectedUser.id,
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
    selectedUser,
    users,
    userID,
    verb,
    onUpdate,
    deleteAction,
  }

  return (
    <Component {...nextProps} />
  )
}

const UsersIndex = ({
  users,
  selectedUser,
  verb,
  hasPendingUpdates,
  deleteAction,
  onUpdate,
}) => {
  const classes = useStyles()

  useDelete({
    fn: deleteAction.run,
    show: selectedUser != null && verb === 'delete',
    type: 'user',
    title: `Remove ${selectedUser.email} from this machine?`,
    fullTitle: true,
  })

  return (
    <main className={classes.root}>
      {selectedUser != null && verb == null && (
        <UpdateDialog
          title={(
            <>
              <Avatar src={selectedUser.picture} className={classes.updateTitleAvatar}>
                {selectedUser.email[0]}
              </Avatar>
              {selectedUser.email}
            </>
          )}
          open={selectedUser != null}
          deleteButton
          collection="AUTH"
          status="READY"
          hasPendingUpdates={hasPendingUpdates}
          query={gql`
            query {
              schemaForm(input: {
                collection: AUTH
                schemaFormKey: "user"
              }) {
                id
                schema
                form
              }
            }
          `}
          getConfigForm={(data) => {
            return {
              id: selectedUser.id,
              modelVersion: 1,
              schemaForm: data.schemaForm,
              model: selectedUser,
            }
          }}
          onSubmit={onUpdate}
        />
      )}
      <List>
        {
          users.map(user => (
            <ListItem
              button
              divider
              key={user.id}
              component={React.forwardRef((props, ref) => (
                <Link to={`${user.id}/`} innerRef={ref} {...props} />
              ))}
            >
              <ListItemIcon>
                <Avatar src={user.picture}>{user.email[0]}</Avatar>
              </ListItemIcon>
              <ListItemText>
                {user.email}
              </ListItemText>
            </ListItem>
          ))
        }
      </List>
    </main>
  )
}

export const Component = UsersIndex
export default enhance(UsersIndex)
