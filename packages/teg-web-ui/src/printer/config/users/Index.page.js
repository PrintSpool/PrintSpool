import React from 'react'
import { Link } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@material-ui/core'
// import { makeStyles } from '@material-ui/core/styles'

import { useQuery } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/Index'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import Loading from '../../../common/Loading'

const UsersQuery = gql`
  query UsersQuery {
    hasPendingUpdates
    users {
      id
      name
      email
      createdAt
      isAdmin
    }
  }
`

// const useStyles = makeStyles(theme => ({
// }))

const enhance = Component => (props) => {
  const { match } = props
  // UsersQuery
  const { userID, verb } = match.params

  const { data, loading, error } = useQuery(UsersQuery, {
    pollInterval: 1000,
  })

  if (loading) {
    return <Loading />
  }

  if (error) {
    throw new Error(JSON.stringify(error))
  }

  const { users } = data

  const nextProps = {
    ...props,
    selectedUser: users.find(c => c.id === userID),
    users,
    userID,
    verb,
  }

  return (
    <Component {...nextProps} />
  )
}

const ComponentsConfigIndex = ({
  users,
  selectedUser,
  verb,
  hasPendingUpdates,
}) => {
  // const classes = useStyles()

  return (
    <main>
      {selectedUser != null && verb == null && (
        <UpdateDialog
          title={`Invite (ID: ${selectedUser.id})`}
          open={selectedUser != null}
          deleteButton
          collection="AUTH"
          status="READY"
          hasPendingUpdates={hasPendingUpdates}
          query={gql`
            query {
              // THIS WILL NOT WORK BECAUSE UPDATE DIALOG FRAGMENT NEEDS A MODEL FIELD
              schemaForm(input: {
                collection: "AUTH"
                schemaFormKey: "user"
              }) {
                ...UpdateDialogFragment
              }
            }
            ${UPDATE_DIALOG_FRAGMENT}
          `}
        />
      )}
      { selectedUser != null && verb === 'delete' && (
        <DeleteConfirmationDialog
          type="user"
          title="User"
          id={selectedUser.id}
          collection="AUTH"
          open={selectedUser != null}
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
                <Avatar src={user.picture}>{user.name[0]}</Avatar>
              </ListItemIcon>
              <ListItemText>
                {user.name}
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
