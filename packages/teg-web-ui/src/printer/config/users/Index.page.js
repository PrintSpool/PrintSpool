import React from 'react'
import { Link } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { useQuery } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import UpdateDialog from '../components/UpdateDialog/Index'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import Loading from '../../../common/Loading'

const UsersQuery = gql`
  query UsersQuery {
    hasPendingUpdates
    users {
      id
      name
      email
      isAdmin
      picture
      createdAt
    }
  }
`

const useStyles = makeStyles(theme => ({
  updateTitleAvatar: {
    float: 'left',
    marginTop: '0.2em',
    marginRight: theme.spacing(1),
  },
}), { useTheme: true })

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

const UsersIndex = ({
  users,
  selectedUser,
  verb,
  hasPendingUpdates,
}) => {
  const classes = useStyles()

  return (
    <main>
      {selectedUser != null && verb == null && (
        <UpdateDialog
          title={(
            <>
              <Avatar src={selectedUser.picture} className={classes.updateTitleAvatar}>
                {selectedUser.name[0]}
              </Avatar>
              {selectedUser.name}
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
              schemaForm: data.schemaForm,
              model: selectedUser,
            }
          }}
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

export const Component = UsersIndex
export default enhance(UsersIndex)
