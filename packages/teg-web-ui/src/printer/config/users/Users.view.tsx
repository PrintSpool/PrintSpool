import React from 'react'
import { Link } from 'react-router-dom'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import PersonIcon from '@material-ui/icons/Person'

import { gql } from '@apollo/client'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'
import useStyles from './Users.styles'

const UsersConfigView = ({
  userID,
  verb,
  users,
  user,
  hasPendingUpdates,
  update,
}) => {
  const classes = useStyles()

  return (
    <main className={classes.root}>
      {
        userID != null && verb == null && (
          <UpdateDialog
            title={user.description}
            open
            deleteButton={!user.isLocalHTTPUser}
            status={'READY'}
            hasPendingUpdates={hasPendingUpdates}
            onSubmit={update}
            variables={{ userID }}
            query={gql`
              query($userID: ID) {
                users(input: { userID: $userID }) {
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
      <List>
        {
          users.map(user => (
            <ListItem
              button
              divider
              key={user.id}
              component={React.forwardRef((props, ref) => (
                <Link to={`${user.id}/`} innerRef={ref} {...props}>
                  <ListItemIcon>
                    <Avatar src={user.picture}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText>
                    {user.description}
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

export default UsersConfigView
